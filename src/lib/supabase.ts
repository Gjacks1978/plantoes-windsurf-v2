import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zhchybqhvjzsmsumxrex.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoY2h5YnFodmp6c21zdW14cmV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NTEwMDMsImV4cCI6MjA2MTUyNzAwM30.62Mh47NuSMam7xJKs3h5kQoRjDtmGe7QU_Igwn2juU0';

export const supabase = createClient(supabaseUrl, supabaseKey);
