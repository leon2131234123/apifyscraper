const { Actor } = require('apify');

Actor.main(async () => {
    const input = await Actor.getInput();
    
    let urls = [];
    
    if (input.urls && input.urls.length > 0) {
        urls = input.urls.map((u, i) => {
            if (typeof u === 'string') return { url: u, id: `photo_${i + 1}` };
            return { url: u.url, id: u.id || u.name || `photo_${i + 1}` };
        });
    }

    console.log(`Downloading ${urls.length} profile photos...`);

    if (urls.length === 0) {
        console.log('No URLs provided.');
        return;
    }

    const store = await Actor.openKeyValueStore('photos');
    const storeInfo = await store.getInfo();
    const storeId = storeInfo.id;

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < urls.length; i++) {
        const { url, id } = urls[i];
        
        try {
            console.log(`[${i + 1}/${urls.length}] Downloading: ${id}`);
            
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                    'Referer': 'https://www.linkedin.com/'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const buffer = Buffer.from(await response.arrayBuffer());
            const contentType = response.headers.get('content-type') || 'image/jpeg';
            
            await store.setValue(id, buffer, { contentType });
            
            const downloadUrl = `https://api.apify.com/v2/key-value-stores/${storeId}/records/${id}`;
            
            await Actor.pushData({
                id,
                originalUrl: url,
                downloadUrl,
                contentType,
                sizeBytes: buffer.length,
                status: 'success'
            });

            successCount++;
            
        } catch (error) {
            console.log(`  Failed: ${error.message}`);
            
            await Actor.pushData({
                id,
                originalUrl: url,
                downloadUrl: null,
                contentType: null,
                sizeBytes: 0,
                status: 'failed',
                error: error.message
            });
            
            failCount++;
        }

        if (i < urls.length - 1) {
            await new Promise(r => setTimeout(r, 500));
        }
    }

    console.log(`\nDone. ${successCount} downloaded, ${failCount} failed.`);
});
