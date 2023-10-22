import Ocorrencia from "../model/Ocorrencia.js";
import redis from 'redis';

const client = redis.createClient()
                    .on('error', (err) => {
                        console.log('Error ' + err);
                    });

client.connect();

async function create({title, type, date, location, description}) {
    try {
        const novaOcorrencia = await Ocorrencia.create({
        title,
        type,
        date,
        location,
        description
        });
        return novaOcorrencia;
    } catch (error) {
        let err = new Error('Erro ao criar a ocorrência: ' + error.message);
        if(error.message.includes("violates not-null constraint")){
            err.status = 400;
        }
        throw err;
    }
}
async function findAll(){
    const value = await new Promise((resolve, reject) => {
        client.get('ocorrencias')
            .catch((err) => {reject(err)})
            .then(async (reply) => {
                if (reply && reply != "[]") {
                    let ocorr = JSON.parse(reply);
                    resolve(ocorr);
                }else{
                    try{
                        const ocorrencias = await Ocorrencia.findAll();
                        client.set('ocorrencias', JSON.stringify(ocorrencias));
                        client.expire('ocorrencias', 300);
                        resolve(ocorrencias);
                    } catch (error) {
                        reject('Erro ao resgatar as ocorrências: '+ error.message);
                    }
                }
            });
    });
    if(value){
        return value;
    }else{
        let err = new Error('Erro ao resgatar as ocorrências');
        err.status = 404;
        throw err;
    }
}
async function findById(id) {
    const value = await new Promise((resolve, reject) => {
        client.get(`ocorrencia-${id}`)
        .catch((err) => {reject(err)})
        .then(async (reply) => {
            if (reply && reply != "{}") {
                let ocorr = JSON.parse(reply);
                resolve(ocorr);
            }else{
                try{
                    const ocorrencia = await Ocorrencia.findByPk(id);
                    if(!ocorrencia){
                        var err =new Error('Ocorrência não encontrada');
                        err.status = 404;
                        reject(err);
                    }
                    client.set(`ocorrencia-${id}`, JSON.stringify(ocorrencia));
                    client.expire(`ocorrencia-${id}`, 300);
                    resolve(ocorrencia);
                } catch (error) {
                    let err = new Error('Erro ao resgatar a ocorrência: ' + error.message);
                    err.status = error.status;
                    reject(err);
                }
            }
        })
    })
    .catch((error)=>{
        let err = new Error('Erro ao procurar a ocorrência: ' + error.message);
        err.status = error.status;
        throw err;
    });
    if(value){
        return value;
    }else{
        new Error('Erro ao procurar a ocorrência: ' + error.message);
        err.status = 404;
        throw err;
    }
}
async function update(id, novosDados, returnObj = false) {
    client.del("ocorrencia-"+id)
    try{
        var modified = await Ocorrencia.update(novosDados, {
            where : {
                id : id
            }
        });
        if(returnObj){
            const ocorrencia = await Ocorrencia.findByPk(id);
            return ocorrencia;
        }
        return modified[0];
    } catch (error) {
        throw new Error(error.message);
    }
}
async function deleteById(id) {
    try{
        client.del("ocorrencia-"+id);
        await Ocorrencia.destroy({
            where : {
                id : id
            }
        });
    } catch (error) {
        throw new Error(error.message);
    }
}

export {create, findAll, findById, update, deleteById, client};