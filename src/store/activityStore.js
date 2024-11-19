import { db, auth } from '@/firebase'
import { collection, getDocs, addDoc } from 'firebase/firestore'
import { defineStore } from 'pinia'

export const useActivityStore = defineStore('activity', {
  state: () => ({
    activities: JSON.parse(localStorage.getItem('activities')) || []
  }),
  actions: {
    async addActivity(type, details = '') {
      const user = auth.currentUser
      if (!user) return

      try {
        const activity = {
          id: Date.now(),
          timestamp: new Date().toLocaleString(), // Используем локальное время пользователя
          type,
          details
        }
        const activityRef = collection(db, `users/${user.uid}/activities`)
        await addDoc(activityRef, activity)
        this.activities.push(activity)
      } catch (error) {
        console.log('Error adding activity:', error)
      }
    },

    async fetchActivities() {
      const user = auth.currentUser
      if (!user) return

      try {
        const activityRef = collection(db, `users/${user.uid}/activities`)
        const querySnapshot = await getDocs(activityRef)

        // Логируем данные перед сохранением в state
        const activitiesData = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp
          }))
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        this.activities = activitiesData
        localStorage.setItem('activities', JSON.stringify(activitiesData))
      } catch (error) {
        console.log('Error fetching activities:', error)
      }
    }
  }
})
