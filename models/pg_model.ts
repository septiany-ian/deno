import {Client} from 'https://deno.land/x/postgres/mod.ts';
import {QueryResult,QueryConfig} from 'https://deno.land/x/postgres/query.ts';

const client = new Client ({
    hostname:"localhost",
    port:5432,
    user:"postgres",
    password:"frankenstein",
    database:"blog_ian"
});


export async function select(qry : QueryConfig | QueryConfig[]){
    await client.connect();
    let tables : any =[]
    let hasil : QueryResult | QueryResult[];
    if (Array.isArray(qry)){
        hasil = await client.multiQuery(qry);
        hasil.forEach((obj)=>{
            tables.push(obj.rowsOfObjects());
        });
    }
    else{
        hasil=await client.query(qry);
        tables=hasil.rowsOfObjects()
    }
    await client.end();

    return tables;
}


export async function insert(qry : QueryConfig):Promise<any[]>{        
    let tables : any = [];
    try{
        await client.connect();
        let hasil : QueryResult = await client.query(qry);
        await client.end();
        console.log(hasil);
        tables[0]='Sukses';
        tables[1]='Jumlah baris yang tersimpan'+hasil.rowCount;
    } catch (error){
        tables[0] = 'Gagal';
        tables[1]=`${error}`;
    }
    return tables;
}