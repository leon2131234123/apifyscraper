# LinkedIn Profile Photo Scraper

Apify actor that does one thing: takes LinkedIn profile URLs, returns profile photo URLs.

Built for feeding into Vision AI pipelines to generate appearance-based personalization variables for cold email campaigns.

## Input

```json
{
    "urls": [
        "https://www.linkedin.com/in/williamhgates",
        "https://www.linkedin.com/in/satyanadella"
    ]
}
```

Or provide a CSV URL with a `linkedinUrl` column:

```json
{
    "csvUrl": "https://your-file-host.com/leads.csv"
}
```

## Output

```json
{
    "linkedinUrl": "https://www.linkedin.com/in/williamhgates",
    "name": "Bill Gates",
    "headline": "Co-chair, Bill & Melinda Gates Foundation",
    "profilePhotoUrl": "https://media.licdn.com/dms/image/v2/...",
    "status": "success",
    "scrapedAt": "2026-04-07T22:00:00.000Z"
}
```

Status values:
- `success` - got the photo URL
- `no_photo` - profile exists but no photo (or uses default placeholder)
- `failed` - couldn't scrape the profile

## Deploy to Apify

1. Push this repo to GitHub
2. Go to [Apify Console](https://console.apify.com) > Actors > Develop new
3. Click "Link Git repository"
4. Select this repo
5. Click Build
6. Run it

## Use in n8n

Hit the Apify API from an HTTP Request node:

```
POST https://api.apify.com/v2/acts/YOUR_USERNAME~linkedin-photo-scraper/runs?token=YOUR_TOKEN

Body:
{
    "urls": ["https://www.linkedin.com/in/target-profile"]
}
```

Then fetch results from the dataset when the run completes.

## Next Step

Pass the `profilePhotoUrl` through a Vision AI API to generate the `{{appearance}}` variable:

> "sharp glasses and a clean shave"  
> "great smile and that California energy"  
> "luscious beard and shiny glasses"
