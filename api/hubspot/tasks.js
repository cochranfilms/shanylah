// HubSpot Tasks API
export default async function handler(req, res) {
  const hubspotApiKey = process.env.HUBSPOT_API_KEY;
  
  if (!hubspotApiKey) {
    return res.status(500).json({ 
      error: 'HubSpot API key not configured. Please set HUBSPOT_API_KEY in Vercel environment variables.' 
    });
  }

  const headers = {
    'Authorization': `Bearer ${hubspotApiKey}`,
    'Content-Type': 'application/json',
  };

  try {
    if (req.method === 'GET') {
      // Fetch tasks
      const response = await fetch('https://api.hubapi.com/crm/v3/objects/tasks?limit=20&properties=hs_task_subject,hs_task_body,hs_task_status,hs_task_priority,hs_task_type', {
        headers,
      });

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform data for frontend
      const tasks = data.results.map(task => ({
        id: task.id,
        taskName: task.properties.hs_task_subject || 'Untitled Task',
        taskBody: task.properties.hs_task_body || '',
        taskStatus: task.properties.hs_task_status || 'NOT_STARTED',
        taskPriority: task.properties.hs_task_priority || 'MEDIUM',
        taskType: task.properties.hs_task_type || 'TODO',
        dueDate: task.properties.hs_task_due_date || '',
        createdAt: task.createdAt
      }));

      return res.status(200).json({ tasks });

    } else if (req.method === 'POST') {
      // Create new task
      const { taskName, taskBody, taskPriority, dueDate, associatedContact } = req.body;

      const taskData = {
        properties: {
          hs_task_subject: taskName,
          hs_task_body: taskBody,
          hs_task_status: 'NOT_STARTED',
          hs_task_priority: taskPriority || 'MEDIUM',
          hs_task_type: 'TODO',
          hs_task_due_date: dueDate
        }
      };

      // Add associated contact if provided
      if (associatedContact) {
        taskData.associations = [{
          to: { id: associatedContact },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 1 }] // Contact to Task association
        }];
      }

      const response = await fetch('https://api.hubapi.com/crm/v3/objects/tasks', {
        method: 'POST',
        headers,
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HubSpot API error: ${errorData.message || response.status}`);
      }

      const newTask = await response.json();
      return res.status(201).json({ 
        success: true, 
        task: newTask,
        message: 'Task created successfully' 
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('HubSpot Tasks API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process tasks request',
      details: error.message 
    });
  }
}
