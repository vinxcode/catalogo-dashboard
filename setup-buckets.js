const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setup() {
  const buckets = ['product-images', 'slider-images'];
  
  for (const bucket of buckets) {
    const { data: existing } = await supabase.storage.getBucket(bucket);
    if (!existing) {
      console.log(`Creating bucket: ${bucket}...`);
      const { data, error } = await supabase.storage.createBucket(bucket, {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
        fileSizeLimit: 5242880 // 5MB
      });
      if (error) {
        console.error(`Error creating ${bucket}:`, error.message);
      } else {
        console.log(`Bucket ${bucket} created!`);
      }
    } else {
       console.log(`Bucket ${bucket} already exists.`);
    }
  }
}

setup();
