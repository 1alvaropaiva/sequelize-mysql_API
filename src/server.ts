import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { supabase } from './data/supabaseConnection';
import { Users } from './types/Users';
const app = fastify();




async function setupServer() {
    await app.register(helmet);
    await app.register(cors, {
        origin: ['http://localhost:8000', 'http://localhost:5173'],
        credentials: true
    });
}

// get
app.get("/users", async () => {
    try {
        const { data: users } = await supabase.from("users").select("*");
        return { value: users }
    } catch (error) {
        console.error(error)
        throw error
    }

})

// post
app.post("/users", async (req, res) => {
    try {
        const { name, email } = req.body as Users
        const { data: createdUser } = await supabase.from("users").insert([
            { name, email }
        ]).select()
        return {
            value: createdUser ? createdUser[0] : null
        }
    } catch (error) {
        console.error(error)
        throw error
    }
})

app.listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 8000
}).then(() => {
    console.log('server online')
})