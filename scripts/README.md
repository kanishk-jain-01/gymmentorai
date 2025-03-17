# Email List Generation Scripts

This directory contains scripts for generating email lists with unsubscribe links.

## Generate Email List

The `generate-unsubscribe-links.js` script generates a list of all users who have opted in to receive promotional emails, along with personalized unsubscribe links.

### Usage

1. Set up your environment variables:

```bash
# In your .env file
EMAIL_SECRET="your-secure-random-string"
EMAIL_BASE_URL="https://your-production-url.com"  # The base URL for unsubscribe links
```

2. Run the script:

```bash
npm run generate-email-list
```

3. Find the generated files in the `email-data` directory:
   - `email-list-YYYY-MM-DD.csv`: CSV file for importing into email services
   - `email-list-YYYY-MM-DD.json`: JSON file for programmatic use

### Environment Variables

- `EMAIL_SECRET`: A secure random string used to generate unsubscribe tokens
- `EMAIL_BASE_URL`: The base URL to use for unsubscribe links
  - If not provided, falls back to `NEXTAUTH_URL`
  - If neither is provided, defaults to `http://localhost:3000`

### Generating for Different Environments

You can generate email lists with links pointing to different environments by changing the `EMAIL_BASE_URL`:

```bash
# For local development
EMAIL_BASE_URL="http://localhost:3000" npm run generate-email-list

# For staging
EMAIL_BASE_URL="https://staging.gymmentorai.com" npm run generate-email-list

# For production
EMAIL_BASE_URL="https://gymmentorai.com" npm run generate-email-list
```

### Security Considerations

- Keep your `EMAIL_SECRET` secure and consistent across environments
- The unsubscribe tokens are generated using HMAC-SHA256 with your secret key
- Each token is unique to the user's email address and cannot be forged without knowing the secret 