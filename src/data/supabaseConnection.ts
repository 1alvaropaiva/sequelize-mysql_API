import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv"

dotenv.config()

const supabaseBaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_KEY || ''

const supabase = createClient(supabaseBaseUrl, supabaseKey, {
    auth: {
        persistSession: false
    }
})

export { supabase }