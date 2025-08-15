# Deployment

## Recommended: Vercel
1. Import the repo on Vercel.
2. Add environment variables (see `ENVIRONMENT.md`).
3. Set Node 18+.
4. Link MongoDB Atlas and other services.
5. Deploy.

## MongoDB Atlas
- Create a cluster, database user, and allow IP access.
- Set `MONGODB_URI` in Vercel env.

## Domains and Auth
- Update `NEXTAUTH_URL` to your production URL.
- Configure GitHub OAuth callback URL accordingly.

## Observability
- Enable Vercel Analytics (optional).
- Monitor API logs and GitHub rate-limit headers.

## Post-Deploy Checklist
- GitHub sign-in works.
- API dashboard creates API keys.
- Test-mode payments succeed and tokens update.
