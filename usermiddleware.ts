import { validateJwt } from "https://deno.land/x/djwt/validate.ts";

const userMidleware = async ({cookies,state}:{cookies:any,state:any}, next:Function) => {
    const jwt = cookies.get("jwt_saya");
    if(jwt){
        const key =  Deno.env.get('JWT_KEY') || ' ' ;
        const data : any= await validateJwt({ jwt,key, algorithm: "HS256" });
        if(data.isValid){
            const username = data.payload.iss;
            state.currentUser=username;
        }else{
            state.currentUser=' ';
            cookies.delete("jwt_saya")
        }
    }
    await next();
}
export default userMidleware;