import fastify from 'fastify';
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { supabase } from './data/supabaseConnection';
import { Users } from './types/Users';

const app = fastify();

async function main() {

    // cors + helmet
    await app.register(helmet);
    await app.register(cors, {
        origin: "*",
        credentials: true
    });

    // swagger
    await app.register(swagger, {
        swagger: {
            info: {
                title: "users crud",
                description: "CRUD de usuarios (fastify + supabase)",
                version: "1.0.0",
            },
            host: "localhost:8000",
            schemes: ["http"],
            consumes: ["application/json"],
            produces: ["application/json"],
        },
    });

    //rotas 
    // get
    app.get("/users", {
        schema: {
            description: "Retorna todos os usuários",
            tags: ["Users"],
            response: {
                200: {
                    description: "Lista de usuários",
                    type: "object",
                    properties: {
                        value: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "string" },
                                    name: { type: "string" },
                                    email: { type: "string" }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, async () => {
        try {
            const { data: users } = await supabase.from("users").select("*");
            return { value: users }
        } catch (error) {
            console.error(error)
            throw error
        }

    })

    // post
    app.post("/users", {
        schema: {
            description: "Cria um novo usuário",
            tags: ["Users"],
            body: {
                type: "object",
                required: ["name", "email"],
                properties: {
                    name: { type: "string" },
                    email: { type: "string" }
                }
            },
            response: {
                200: {
                    description: "Usuário criado",
                    type: "object",
                    properties: {
                        value: {
                            type: "object",
                            properties: {
                                id: { type: "string" },
                                name: { type: "string" },
                                email: { type: "string" }
                            }
                        }
                    }
                }
            }
        }
    }, async (req, res) => {
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
    }>("/users/:id", {
        schema: {
            description: "Atualiza um usuário existente pelo ID",
            tags: ["Users"],
            params: {
                type: "object",
                properties: {
                    id: { type: "string", description: "UUID do usuário" }
                },
                required: ["id"]
            },
            body: {
                type: "object",
                required: ["name", "email"],
                properties: {
                    name: { type: "string" },
                    email: { type: "string" }
                }
            },
            response: {
                200: {
                    description: "Usuário atualizado",
                    type: "object",
                    properties: {
                        value: {
                            type: "object",
                            properties: {
                                id: { type: "string" },
                                name: { type: "string" },
                                email: { type: "string" }
                            }
                        }
                    }
                }
            }
        }
    }, async (req, res) => {
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
    }>("/users/:id", {
        schema: {
            description: "Remove um usuário pelo ID",
            tags: ["Users"],
            params: {
                type: "object",
                properties: {
                    id: { type: "string", description: "UUID do usuário" }
                },
                required: ["id"]
            },
            response: {
                200: {
                    description: "Usuário deletado",
                    type: "object",
                    properties: {
                        value: {
                            type: "object",
                            properties: {
                                id: { type: "string" },
                                name: { type: "string" },
                                email: { type: "string" }
                            }
                        }
                    }
                }
            }
        }
    }, async (req, res) => {
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

    // swagger ui
    await app.register(swaggerUi, {
        routePrefix: "/docs",
        uiConfig: {
            docExpansion: "full",
            deepLinking: false,
        },
        staticCSP: true,
        transformStaticCSP: (header) => header,
    });

    // start server
    await app.listen({
        host: "0.0.0.0",
        port: process.env.PORT ? Number(process.env.PORT) : 8000
    });

    console.log("server online");
}

main();