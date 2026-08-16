# Metro Manila Movies — Supabase Implementation Plan

## Decision

Yes. Metro Manila Movies can connect to a different Supabase account or, preferably, a separate Supabase **organization and project** owned by the site owner. This keeps the movie guide’s database, uploaded media, billing, and access separate from unrelated applications.

**Recommended ownership model:** the client creates a new Supabase organization for Metro Manila Movies, creates one production project inside it, and invites the developer only with the access needed to set it up. The client remains the owner and billing contact.

## Goals before launch

- Store movie listings, cinemas, showtimes, editorial updates, and user submissions safely.
- Let public visitors browse published information without signing in.
- Give editors a protected dashboard for creating and updating content.
- Protect private submissions and staff-only information.
- Keep media files separate from unrelated Supabase projects.
- Ensure the site can be recovered and maintained after launch.

## Scope for the first live version

### Public website

- Browse movie listings, cinema locations, dates, and showtimes.
- Search and filter published movies.
- View public editorial details such as synopsis, age rating, poster, trailer link, and release date.
- Offer a contact form and a clear WhatsApp contact option for business inquiries.

### Staff workspace

- Sign in using Supabase Auth.
- Create, edit, publish, unpublish, and archive movie listings.
- Manage cinemas and showtimes.
- Review visitor submissions before publication.
- Upload approved posters and supporting images.

### Not included until a later phase

- Ticket sales or payments.
- Public user accounts and public submissions. Visitors will contact the team through the approved contact channels instead.
- Automated scraping of cinema sites without permission.
- Public file uploads.

## Data design

| Data area | Main records | Access |
| --- | --- | --- |
| Movies | title, synopsis, rating, runtime, release date, trailer URL, publication state | Public can read published records only; staff can manage all. |
| Cinemas | cinema name, mall, city, address, map link | Public can read active records; staff can manage. |
| Showtimes | movie, cinema, date/time, source, last verified date | Public can read published/current records; staff can manage. |
| Images | posters and editorial images in Storage | Public can read approved public assets; only staff can upload/manage. |
| Submissions | suggested movies/showtimes, submitter contact, moderation status | Only assigned staff can read and manage. |
| Audit log | editor, action, affected record, time | Staff administrators only. |

## Security model

1. Enable Supabase Auth for staff members only at launch.
2. Create staff roles: **admin** and **editor**.
3. Enable Row Level Security (RLS) on every database table.
4. Allow anonymous visitors to read only explicitly published public records.
5. Restrict all drafts, submissions, audit logs, and staff records to signed-in staff with the correct role.
6. Create separate Storage buckets for `public-posters` and `private-submissions`.
7. Never expose the Supabase `service_role`/secret key in browser code. It stays only in the server environment.
8. Store Supabase connection values in the hosting environment, never in the Git repository.

## Technical connection plan

### Phase 1 — Create and secure the new Supabase project

1. Client creates a dedicated Supabase organization and production project for Metro Manila Movies.
2. Choose the nearest appropriate production region and set the client as billing owner.
3. Configure Auth for staff email sign-in; initially allow only named staff emails.
4. Record the project URL and publishable key in secure deployment settings.
5. Keep the service-role key server-only; do not share it in chat or add it to `NEXT_PUBLIC_` variables.
6. Confirm file-storage and database limits before uploading a large poster collection.

### Phase 2 — Build the database and storage

1. Define the tables listed above, including publication state and timestamps.
2. Add stable IDs and relational links: showtimes belong to a movie and cinema.
3. Add database constraints so invalid dates, duplicate showtimes, and missing required fields cannot be saved.
4. Enable RLS and create the policies before adding live data.
5. Create the two Storage buckets and their access policies.
6. Add an audit-log record for staff publishing, unpublishing, editing, or deleting content.

### Phase 3 — Connect the website

1. Add the Supabase client library to Metro Manila Movies.
2. Replace the current placeholder/local data path with Supabase queries.
3. Build the staff sign-in and management screens.
4. Add server-side validation for all staff writes and media uploads.
5. Add public pages that query only published records.
6. Add clear “last verified” information for showtimes so visitors understand freshness.

### Phase 4 — Populate and test

1. Add a small, representative set of real movie, cinema, and showtime data.
2. Test visitor access while signed out: published records should display; drafts and submissions must not.
3. Test each editor action: create draft, edit, publish, unpublish, archive, and upload poster.
4. Test admin-only actions and confirm that an editor cannot perform them.
5. Test failed uploads, invalid form input, expired staff sessions, and missing images.
6. Review Supabase security advisors and resolve all high-priority findings.

### Phase 5 — Deploy and launch

1. Configure the production website with the production Supabase URL and publishable key through the hosting settings.
2. Configure the live website URL in Supabase Auth redirect/allowed URL settings.
3. Set the site’s custom domain, if applicable.
4. Create the first administrator account and test sign-in on the live URL.
5. Verify the public site, editorial dashboard, image uploads, and showtime updates on the deployed site.
6. Enable backups/monitoring appropriate to the selected Supabase plan.
7. Create a short operational handover: how to add a movie, update showtimes, publish a listing, and remove outdated content.

## Important project decision: Supabase vs. existing placeholder database

The current Metro Manila Movies project includes a starter Cloudflare D1 placeholder, but it is not currently configured as a live database. For this launch, use **Supabase as the single system of record** for content and file storage. Do not run both D1 and Supabase for the same listings unless there is a future, specific reason to do so.

## Information needed from the client before build begins

1. **Supabase connection confirmed**
   - Project URL: `https://kegvufvjlcwidlafhsem.supabase.co`
   - Publishable key: retrieve from Supabase Dashboard → Project Settings → API Keys → Publishable key, then add it only to the secure deployment environment.
   - The secret key must remain server-only and must never be committed to GitHub or sent in chat.
2. **Initial administrators confirmed**
   - `jlbtradingcorp@gmail.com`
   - `jairadavid128@gmail.com`
3. **Listing fields confirmed**: use the movie and showtime fields already present in the approved site draft.
4. **Showtime sources confirmed**: use official cinema/mall sources for Metro Manila, including SM Cinema, Ayala Malls Cinemas, The Podium, Estancia, Rockwell, Cash & Carry, and other official major-mall cinema pages. Each showtime record must include a “last verified” timestamp.
5. **Contact workflow confirmed**
   - Business WhatsApp: `+63 994 085 1047`
   - Contact form recipient: `jairadavid128@gmail.com`
   - Public submissions and automatic public posting are out of scope for launch.
6. **Branding and poster policy confirmed**: use the approved current site draft and its existing visual direction.
7. **Custom domain confirmed**: yes. Before launch, provide the chosen domain name and access to its DNS settings so the live site and Supabase Auth redirect URLs can be configured.

## Launch acceptance checklist

- [ ] Dedicated Supabase project is owned by the client.
- [ ] No Supabase secret/service-role key is present in frontend code or source control.
- [ ] RLS is enabled and tested on every exposed table.
- [ ] Storage policies prevent public upload or private-file access.
- [ ] Signed-out visitors see only published listings.
- [ ] Editors can manage content but cannot access admin-only records/actions.
- [ ] Backups, billing alerts, and storage usage alerts are configured.
- [ ] Production Auth redirect URLs are set.
- [ ] The website passes a live smoke test on desktop and mobile.
- [ ] The client has a documented content-update process and a named system owner.

## Cost and account guidance

The new project can start on Supabase’s Free plan for a small launch, but a production editorial site should monitor database size, file storage, bandwidth, and inactivity rules. Upgrade only when the site’s actual usage or operational requirements justify it. The separate project prevents the existing Supabase storage warning from affecting Metro Manila Movies.

## References

- [Supabase Next.js setup](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase pricing](https://supabase.com/pricing)
