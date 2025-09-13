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
        const { name, email } = req.body as Users;

        const { data: createdUser, error } = await supabase
            .from("users")
            .insert([{ name, email }])
            .select();

        if (error) throw error;

        return {
            value: createdUser ? createdUser[0] : null,
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
});

// put
app.put<{
    Params: { id: string }
    Body: Users
}>("/users/:id", async (req, res) => {
    try {
        const { id } = req.params; // já tipado como string (UUID)
        const { name, email } = req.body;

        const { data: updatedUser, error } = await supabase
            .from("users")
            .update({ name, email })
            .eq("id", id)
            .select();

        if (error) throw error;

        return {
            value: updatedUser ? updatedUser[0] : null,
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
});

// delete
app.delete<{
    Params: { id: string }
}>("/users/:id", async (req, res) => {
    try {
        const { id } = req.params; // já tipado como string (UUID)

        const { data: deletedUser, error } = await supabase
            .from("users")
            .delete()
            .eq("id", id)
            .select();

        if (error) throw error;

        return {
            value: deletedUser ? deletedUser[0] : null,
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
});

app.listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 8000
}).then(() => {
    console.log('server online')
})