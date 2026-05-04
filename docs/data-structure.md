# Data Structure Documentation

## i4l_publish.json
This is the main data file for the application, located at `src/data/i4l_publish.json`.

## Membership Content Data

Membership CTA + FAQ copy is stored in:
- `src/data/membershipPageContent.js`

Current usage:
- `src/components/MembershipCTA.jsx` consumes `hero` and `benefits`
- `src/components/MembershipFaqAccordion.jsx` consumes `faq`
- `src/pages/MembershipFaqPage.jsx` renders the FAQ page

### File Management
- Location: `src/data/i4l_publish.json`
- Backup: Always maintain a backup before making changes
- Version Control: Track changes through Git

### Update Process
1. Make changes to the data file
2. Test the changes locally
3. Commit the changes:
   ```bash
   git add src/data/i4l_publish.json
   git commit -m "Update i4l_publish.json"
   git push
   ```

### Data Validation
- Ensure all required fields are present
- Validate data format before committing
- Test the application after data updates

## Data Backup
- Keep a backup of the data file
- Document major data structure changes
- Consider implementing automated backups
