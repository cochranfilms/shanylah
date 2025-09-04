// HubSpot Task Completion API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const hubspotApiKey = process.env.HUBSPOT_API_KEY;
  
  if (!hubspotApiKey) {
    return res.status(500).json({ 
      error: 'HubSpot API key not configured. Please set HUBSPOT_API_KEY in Vercel environment variables.' 
    });
  }

  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Task ID is required' });
  }

  const headers = {
    'Authorization': `Bearer ${hubspotApiKey}`,
    'Content-Type': 'application/json',
  };

  try {
    // Update task status to completed
    const taskData = {
      properties: {
        hs_task_status: 'COMPLETED'
      }
    };

    const response = await fetch(`https://api.hubapi.com/crm/v3/objects/tasks/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HubSpot API error: ${errorData.message || response.status}`);
    }

    const updatedTask = await response.json();
    return res.status(200).json({ 
      success: true, 
      task: updatedTask,
      message: 'Task completed successfully' 
    });

  } catch (error) {
    console.error('HubSpot Task Completion Error:', error);
    return res.status(500).json({ 
      error: 'Failed to complete task',
      details: error.message 
    });
  }
}
