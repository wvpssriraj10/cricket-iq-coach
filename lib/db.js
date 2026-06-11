"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSupabaseConfigured = isSupabaseConfigured;
exports.getDb = getSupabase;
var supabase_js_1 = require("@supabase/supabase-js");
var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
var supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Fallback to any to avoid strict type errors with missing Supabase definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var _supabase = null;
function getSupabase() {
    if (!_supabase) {
        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set. See docs/SUPABASE_SETUP.md.");
        }
        _supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
    }
    return _supabase;
}
/** Returns true if Supabase env vars are set (so API can use DB). */
function isSupabaseConfigured() {
    return Boolean(supabaseUrl && supabaseServiceKey);
}
