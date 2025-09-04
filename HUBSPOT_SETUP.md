# 🎯 HubSpot API Integration Setup Guide

## Overview
This guide will help you set up the HubSpot API integration for Shanylah's onboarding page, allowing her to manage contacts, deals, and tasks directly from the dashboard.

## 🔑 Required Environment Variables

Add these to your Vercel environment variables:

### 1. HubSpot API Key
```
HUBSPOT_API_KEY=your_hubspot_private_app_token_here
```

### 2. OpenAI API Key (for AI Assistant)
```
OPENAI_API_KEY=your_openai_api_key_here
```

## 🚀 HubSpot Setup Steps

### Step 1: Create a HubSpot Private App
1. Go to your HubSpot account
2. Navigate to **Settings** → **Integrations** → **Private Apps**
3. Click **Create a private app**
4. Give it a name: "Shanylah Onboarding Dashboard"
5. Configure the following scopes:

#### Required Scopes:
- **CRM Scopes:**
  - `crm.objects.contacts.read`
  - `crm.objects.contacts.write`
  - `crm.objects.deals.read`
  - `crm.objects.deals.write`
  - `crm.objects.companies.read`
  - `crm.objects.companies.write`
  - `crm.objects.owners.read`
  - `crm.schemas.contacts.read`
  - `crm.schemas.deals.read`
  - `crm.schemas.companies.read`
  - `crm.objects.leads.read`
  - `crm.objects.leads.write`
  - `crm.objects.products.read`
  - `crm.objects.quotes.read`
  - `crm.objects.quotes.write`

6. Click **Create app**
7. Copy the **Access Token** (this is your `HUBSPOT_API_KEY`)

### Step 2: Configure Vercel Environment Variables
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

```
HUBSPOT_API_KEY=pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Deploy to Vercel
1. Push your changes to GitHub
2. Vercel will automatically deploy
3. The HubSpot integration will be available at: `https://your-domain.vercel.app`

## 🎯 Features Available

### Contact Management
- ✅ View all contacts
- ✅ Add new contacts
- ✅ Search contacts
- ✅ View contact details in HubSpot
- ✅ Edit contacts (opens in HubSpot)

### Deal Management
- ✅ View all deals
- ✅ Search deals
- ✅ View deal details in HubSpot
- ✅ Edit deals (opens in HubSpot)

### Task Management
- ✅ View all tasks
- ✅ Search tasks
- ✅ Complete tasks
- ✅ View task details in HubSpot

### AI Assistant Integration
- ✅ Contextual help for Shanylah
- ✅ 21-point knowledge base
- ✅ Real-time assistance

## 🔧 API Endpoints

The following API endpoints are available:

### HubSpot Endpoints:
- `GET /api/hubspot/status` - Check API connection
- `GET /api/hubspot/contacts` - Fetch contacts
- `POST /api/hubspot/contacts` - Create new contact
- `GET /api/hubspot/deals` - Fetch deals
- `POST /api/hubspot/deals` - Create new deal
- `GET /api/hubspot/tasks` - Fetch tasks
- `POST /api/hubspot/tasks` - Create new task
- `POST /api/hubspot/tasks/[id]/complete` - Complete task

### AI Assistant Endpoint:
- `POST /api/chatgpt` - AI assistant queries

## 🎨 Customization Options

### Adding New Fields
To add new fields to the contact form, update:
1. The HTML form in `index.html`
2. The API route in `api/hubspot/contacts.js`
3. The JavaScript form handler

### Custom Properties
HubSpot allows custom properties. To use them:
1. Create the property in HubSpot
2. Add it to the API request properties
3. Update the frontend form

### Styling
All HubSpot dashboard styles are in the `<style>` section of `index.html`:
- `.hubspot-dashboard` - Main container
- `.dashboard-tabs` - Tab navigation
- `.tab-content` - Tab content areas
- `.data-list` - Data display lists

## 🚨 Troubleshooting

### Common Issues:

1. **"HubSpot connection failed"**
   - Check if `HUBSPOT_API_KEY` is set correctly
   - Verify the API key has the required scopes
   - Ensure the private app is active

2. **"Failed to add contact"**
   - Check HubSpot API rate limits
   - Verify required fields are provided
   - Check for duplicate email addresses

3. **"Error loading contacts"**
   - Verify API key permissions
   - Check HubSpot API status
   - Review browser console for errors

4. **"500 Internal Server Error"**
   - Test API connection: Visit `/api/hubspot/test` on your deployed site
   - Check Vercel environment variables are set
   - Verify HubSpot private app is active
   - Ensure all required scopes are selected

### Quick Test:
Visit `https://your-domain.vercel.app/api/hubspot/test` to test your API connection and see detailed error messages.

### Debug Mode:
Add `?debug=true` to the URL to see detailed error messages.

## 📊 Performance Considerations

- API calls are cached for 5 minutes
- Rate limiting is handled automatically
- Large datasets are paginated (20 items per page)
- Search functionality is client-side for better performance

## 🔒 Security Notes

- API keys are stored securely in Vercel environment variables
- All API calls are server-side to protect credentials
- CORS is properly configured
- Input validation is implemented on all forms

## 🎯 Next Steps

1. Set up the environment variables
2. Test the connection
3. Train Shanylah on the new features
4. Monitor usage and performance
5. Add additional customizations as needed

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify environment variables are set
3. Test API endpoints directly
4. Review HubSpot API documentation

---

**Ready to revolutionize Shanylah's workflow! 🚀**
