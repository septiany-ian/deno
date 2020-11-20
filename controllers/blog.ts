import { renderFileToString } from 'https://deno.land/x/dejs/mod.ts';
import { insert,select } from '../models/pg_model.ts';
import TSql from '../models/sql.ts';
import { makeJwt, setExpiration, Jose, Payload } from "https://deno.land/x/djwt/create.ts";

const home = async({response,state} : {response :any,state:any}) =>{
    let userLogged : string = ' Guest ';
    if((state.currentUser != undefined) && ( state.currentUser != ' ')){
        userLogged = state.currentUser;
    }
    const dataTable = await select(
        [
            {text : TSql['KtgFindAll']},
            {text : TSql['BlogInfoFindAll']}
        ]
    )
    const html = await renderFileToString("./views/home.ejs", {

        data:{
            userInfo:userLogged,
            nama:"Septiany Diyah Ayu Kusuma Amalia",
            pemrograman :dataTable[0],
            blogInfo:dataTable[1],
            mahasiswa :[
                {nim:"01", "nama":"Eko"},
                {nim:"02", "nama":"Budi"},
                {nim:"03", "nama":"Wati"}
            ]
        },
        subview : {
            namafile : "./views/blog-main.ejs",
            showjumbotron : true
        }
    });
    response.body=new TextEncoder().encode(html);
}

const signup = async({response,request,state}:{response:any,request:any,state:any})=>{
    if(!request.hasBody){
        let signupError :string ='';
        if((state.pesanError != undefined) && (state.pesanError != ' ')){
            signupError = state.pesanError;
    }
    const html = await renderFileToString("./views/home.ejs",{
        data :{
            nama:"Septiany Diyah Ayu Kusuma Amalia",
            pemrograman :await select({
                text : TSql['KtgFindInKode'],
                args : ['php','ts','js']
            }),
            statusSignup:signupError,
            blogInfo:await select({
                text:TSql['BlogInfoFindAll']
            }),
            mahasiswa :[
                {nim:"01", "nama":"Eko"},
                {nim:"02", "nama":"Budi"},
                {nim:"03", "nama":"Wati"}
            ]
        },
        subview : {
            namafile :"./views/signup.ejs",
            showjumbotron : false
        }
    });
    response.body = new TextEncoder().encode(html);

    }else{
        const body =await request.body().value;
        const parseData = new URLSearchParams(body);
        const namalengkap= parseData.get("fullname");
        const namauser= parseData.get("username");
        const pwd= parseData.get("paswd");

        let hasil = await insert({
            text:TSql['InsertUser'],
            args : [namauser,namalengkap,pwd]
        });

        if(hasil[0]== 'Sukses'){
            state.pesanError = '';
            response.body = "Sukses menyimpan data ke database";
        }else{
            state.pesanError = hasil[1];
            response.redirect('/daftar');
        }
    }
}

const login = async({response,request,state,cookies}:{response:any,request:any,state:any,cookies:any})=>{
    if(!request.hasBody){
        let loginError :string ='';
        if((state.statusLogin != undefined) && (state.statusLogin != ' ')){
            loginError = state.statusLogin;
        }

        let userLogged : string = ' Guest ';
        if((state.currentUser != undefined) && ( state.currentUser != ' ')){
            userLogged = state.currentUser;
        }

    const html = await renderFileToString("./views/home.ejs",{
        data :{
            statusLogin:loginError,
            userInfo:userLogged,
            nama:"Septiany Diyah Ayu Kusuma Amalia",
            pemrograman :await select({
                text : TSql['KtgFindInKode'],
                args : ['php', 'ts', 'js']
            }),
            blogInfo:await select({
                text:TSql['BlogInfoFindAll']
            }),
            mahasiswa :[
                {nim:"01", "nama":"Eko"},
                {nim:"02", "nama":"Budi"},
                {nim:"03", "nama":"Wati"}
            ]
        },
        subview : {
            namafile :"./views/login.ejs",
            showjumbotron : false
        }
    });
    response.body = new TextEncoder().encode(html);

    }else{
        const body =await request.body().value;
        const parseData = new URLSearchParams(body);
        const namauser:string= parseData.get("username")||' ';
        const pwd= parseData.get("paswd");

        let hasil = await select({
            text : TSql['SelectUser'],
            args : [namauser,pwd]
        });

        if(hasil.length>0){
            const key="your-secret";
            const payload: Payload = {
                iss: namauser,
                exp: setExpiration(new Date().getTime()+1000*60*60),
            };
            const header: Jose = {
                alg: "HS256",
                typ: "JWT",
            };

            const jwt = await makeJwt({ header, payload, key: Deno.env.get('JWT_KEY') || ' ' });
            cookies.set("jwt_saya", jwt);

            //sukses login
            state.login = ' ';
            response.redirect('/');
        } else{
            state.statusLogin = 'Username atau Password Anda Salah !!!';
            response.redirect('/login');
        }
    }
}

const kategori = async({params,response}:{params:{id:string},response:any})=>{
    response.body="ID Parameter : " + params.id;
}

const logout = async ({response,state,cookies}:{response:any,state:any,cookies:any})=>{
    state.currentUser =' ';
    cookies.delete ("jwt_saya");
    response.redirect("/");
}

export {home,signup,kategori,login,logout};