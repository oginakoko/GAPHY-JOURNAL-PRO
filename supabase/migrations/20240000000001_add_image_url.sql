-- Add image_url column
ALTER TABLE life_journal_entries
ADD COLUMN IF NOT EXISTS image_url text;

-- Create storage bucket for images if not exists
INSERT INTO storage.buckets (id, name)
VALUES ('journal-images', 'journal-images')
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'journal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own images"
ON storage.objects FOR SELECT
USING (bucket_id = 'journal-images' AND auth.uid()::text = (storage.foldername(name))[1]);
