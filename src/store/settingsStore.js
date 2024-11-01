import { defineStore } from 'pinia'
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useUserStore } from './userStore'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    unitOptions: JSON.parse(localStorage.getItem('unitOptions')) || [],
    categoryOptions: JSON.parse(localStorage.getItem('categoryOptions')) || [],
    loading: false,
    error: null
  }),

  actions: {
    async loadSettings() {
      const userId = this.getUserId()
      if (!userId) {
        this.unitOptions = [] // Очистить, если нет пользователя
        this.categoryOptions = []
        return
      }

      try {
        await this.updateDefaultValues(userId)
        this.listenToSettingsChanges(userId, 'units', 'unitOptions')
        this.listenToSettingsChanges(userId, 'categories', 'categoryOptions')
      } catch (error) {
        this.handleError('Error loading settings:', error)
      }
    },

    async updateDefaultValues(userId) {
      try {
        await this.initializeSettings(userId, 'units', this.unitOptions)
        await this.initializeSettings(userId, 'categories', this.categoryOptions)
      } catch (error) {
        this.handleError('Error updating default values:', error)
      }
    },

    async initializeSettings(userId, settingType, defaultValues) {
      const docRef = doc(db, `users/${userId}/settings/${settingType}`)
      const docSnap = await getDoc(docRef)

      const currentValues = docSnap.exists() ? docSnap.data().values : []
      const newValues = defaultValues.filter((value) => !currentValues.includes(value))

      if (newValues.length > 0) {
        await setDoc(docRef, { values: [...currentValues, ...newValues] })
      }
    },

    listenToSettingsChanges(userId, settingType, optionsKey) {
      onSnapshot(doc(db, `users/${userId}/settings/${settingType}`), (doc) => {
        if (doc.exists()) {
          const data = doc.data()
          if (data.values) {
            this[optionsKey] = data.values
            localStorage.setItem(optionsKey, JSON.stringify(data.values)) // Update local cache
          }
        } else {
          this.initializeSettings(userId, settingType, this[optionsKey])
        }
      })
    },

    async addSetting(settingType, newSetting, optionsKey) {
      try {
        const userId = this.getUserId()
        if (!this[optionsKey].includes(newSetting)) {
          const updatedSettings = [...this[optionsKey], newSetting]
          await setDoc(doc(db, `users/${userId}/settings/${settingType}`), {
            values: updatedSettings
          })
        }
      } catch (error) {
        this.handleError(`Error adding ${settingType.slice(0, -1)}:`, error)
      }
    },

    async removeSetting(settingType, setting, optionsKey) {
      try {
        const userId = this.getUserId()
        const updatedSettings = this[optionsKey].filter((s) => s !== setting)
        await setDoc(doc(db, `users/${userId}/settings/${settingType}`), {
          values: updatedSettings
        })
      } catch (error) {
        this.handleError(`Error removing ${settingType.slice(0, -1)}:`, error)
      }
    },

    async addUnit(newUnit) {
      await this.addSetting('units', newUnit, 'unitOptions')
    },

    async removeUnit(unit) {
      await this.removeSetting('units', unit, 'unitOptions')
    },

    async addCategory(newCategory) {
      await this.addSetting('categories', newCategory, 'categoryOptions')
    },

    async removeCategory(category) {
      await this.removeSetting('categories', category, 'categoryOptions')
    },

    getUserId() {
      const userStore = useUserStore()
      return userStore.user ? userStore.user.uid : null
    },

    handleError(message, error) {
      console.error(message, error)
      this.error = error.message
    }
  }
})
