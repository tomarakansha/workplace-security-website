import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

//function writeUserData(userId, name, email) {
    //set(ref(database, 'users/' + userId), {
///      username: name,
      email: email
 //   });
//}

// Example Usage:
//writeUserData('1', 'John Doe', 'john@example.com');
// Initialize Firebase (update with your config)

const firebaseConfig = {
  apiKey: "AIzaSyCGg_Id2UwRUTnzUVsvzTtuyh-EzB7Qbmg",
  authDomain: "testing-1780e.firebaseapp.com",
  projectId: "testing-1780e",
  storageBucket: "testing-1780e.firebasestorage.app",
  messagingSenderId: "17707782492",
  appId: "1:17707782492:web:8e9186df915e77c95bf199"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get database reference
const db = firebase.database();

class IncidentManager {
  static async addIncident(incidentData) {
    try {
      // Generate a unique ID for the incident
      const newIncidentRef = db.ref('incidents').push();
      
      // Add metadata
      const incident = {
        ...incidentData,
        id: newIncidentRef.key,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        updatedAt: firebase.database.ServerValue.TIMESTAMP,
        status: 'Open'
      };

      // Save the incident
      await newIncidentRef.set(incident);

      // Update indexes
      await this.updateIndexes(incident);

      return incident.id;
    } catch (error) {
      console.error('Error adding incident:', error);
      throw error;
    }
  }

  static async updateIndexes(incident) {
    const updates = {};

    // Index by date
    const date = new Date().toISOString().split('T')[0];
    updates[`incidentsByDate/${date}/${incident.id}`] = true;

    // Index by location
    if (incident.location) {
      updates[`incidentsByLocation/${incident.location}/${incident.id}`] = true;
    }

    // Index by type
    if (incident.type) {
      updates[`incidentsByType/${incident.type}/${incident.id}`] = true;
    }

    // Index by priority
    if (incident.priority) {
      updates[`incidentsByPriority/${incident.priority}/${incident.id}`] = true;
    }

    // Update all indexes atomically
    await db.ref().update(updates);
  }

  static async getIncidentById(id) {
    const snapshot = await db.ref(`incidents/${id}`).once('value');
    return snapshot.val();
  }

  static async updateIncident(id, updates) {
    try {
      const incidentRef = db.ref(`incidents/${id}`);
      
      // Add update timestamp
      updates.updatedAt = firebase.database.ServerValue.TIMESTAMP;
      
      await incidentRef.update(updates);
      
      // If type, location, or priority changed, update indexes
      if (updates.type || updates.location || updates.priority) {
        const incident = await this.getIncidentById(id);
        await this.updateIndexes(incident);
      }

      return true;
    } catch (error) {
      console.error('Error updating incident:', error);
      throw error;
    }
  }

  static async deleteIncident(id) {
    try {
      const incident = await this.getIncidentById(id);
      if (!incident) throw new Error('Incident not found');

      const updates = {};
      
      // Remove from main incidents node
      updates[`incidents/${id}`] = null;
      
      // Remove from indexes
      const date = new Date(incident.createdAt).toISOString().split('T')[0];
      updates[`incidentsByDate/${date}/${id}`] = null;
      updates[`incidentsByLocation/${incident.location}/${id}`] = null;
      updates[`incidentsByType/${incident.type}/${id}`] = null;
      updates[`incidentsByPriority/${incident.priority}/${id}`] = null;

      // Perform all deletions atomically
      await db.ref().update(updates);

      return true;
    } catch (error) {
      console.error('Error deleting incident:', error);
      throw error;
    }
  }

  static listenToIncidents(callback) {
    return db.ref('incidents')
      .orderByChild('createdAt')
      .on('value', (snapshot) => {
        const incidents = [];
        snapshot.forEach((child) => {
          incidents.push(child.val());
        });
        callback(incidents.reverse()); // Most recent first
      });
  }

  static getIncidentsByLocation(location) {
    return db.ref(`incidentsByLocation/${location}`)
      .once('value')
      .then(async (snapshot) => {
        const incidents = [];
        const ids = Object.keys(snapshot.val() || {});
        
        for (const id of ids) {
          const incident = await this.getIncidentById(id);
          if (incident) incidents.push(incident);
        }
        
        return incidents;
      });
  }

  static getIncidentsByType(type) {
    return db.ref(`incidentsByType/${type}`)
      .once('value')
      .then(async (snapshot) => {
        const incidents = [];
        const ids = Object.keys(snapshot.val() || {});
        
        for (const id of ids) {
          const incident = await this.getIncidentById(id);
          if (incident) incidents.push(incident);
        }
        
        return incidents;
      });
  }
}

// Event handler for form submission
document.getElementById('incidentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const incidentData = {
    priority: document.querySelector('.priority-btn.active')?.dataset.priority,
    type: form.querySelector('select').value,
    location: form.querySelector('input[type="text"]').value,
    description: form.querySelector('textarea').value,
    // Add image handling if needed
  };

  try {
    await IncidentManager.addIncident(incidentData);
    
    // Show success message
    const statusBanner = document.getElementById('statusBanner');
    statusBanner.classList.remove('d-none');
    statusBanner.classList.remove('alert-danger');
    statusBanner.classList.add('alert-success');
    statusBanner.textContent = 'Incident reported successfully!';

    // Redirect after delay
    setTimeout(() => {
      window.location.href = 'safety-portal-tailwind.html';
    }, 5000);
  } catch (error) {
    console.error('Error submitting incident:', error);
    
    // Show error message
    const statusBanner = document.getElementById('statusBanner');
    statusBanner.classList.remove('d-none');
    statusBanner.classList.remove('alert-success');
    statusBanner.classList.add('alert-danger');
    statusBanner.textContent = 'Error reporting incident. Please try again.';
  }
});
