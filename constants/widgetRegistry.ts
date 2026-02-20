import type { WidgetType } from '../types';

type WidgetRegistryEntry = {
  label: string;
  icon: string;
  accent: string;
  category: 'training' | 'nutrition' | 'wellness' | 'progress' | 'general';
};

export const WIDGET_REGISTRY: Record<WidgetType, WidgetRegistryEntry> = {
  'metric-card': { label: 'Metric Card', icon: 'activity', accent: '#6D00FF', category: 'general' },
  'workout-card': { label: 'Workout Card', icon: 'dumbbell', accent: '#6D00FF', category: 'training' },
  'meal-plan': { label: 'Meal Plan', icon: 'utensils', accent: '#6D00FF', category: 'nutrition' },
  'hydration-tracker': { label: 'Hydration Tracker', icon: 'droplet', accent: '#6D00FF', category: 'nutrition' },
  'progress-dashboard': { label: 'Progress Dashboard', icon: 'bar-chart-2', accent: '#6D00FF', category: 'progress' },
  'insight-card': { label: 'Insight Card', icon: 'lightbulb', accent: '#6D00FF', category: 'general' },
  'season-timeline': { label: 'Season Timeline', icon: 'calendar', accent: '#6D00FF', category: 'progress' },
  'today-card': { label: 'Today Card', icon: 'sun', accent: '#6D00FF', category: 'general' },
  'exercise-row': { label: 'Exercise Row', icon: 'list', accent: '#6D00FF', category: 'training' },
  'workout-history': { label: 'Workout History', icon: 'clock', accent: '#6D00FF', category: 'training' },
  'body-stats': { label: 'Body Stats', icon: 'user', accent: '#6D00FF', category: 'progress' },
  'max-rep-calculator': { label: '1RM Calculator', icon: 'calculator', accent: '#6D00FF', category: 'training' },
  'rest-timer': { label: 'Rest Timer', icon: 'timer', accent: '#6D00FF', category: 'training' },
  'heart-rate': { label: 'Heart Rate', icon: 'heart', accent: '#6D00FF', category: 'wellness' },
  'supplement-stack': { label: 'Supplement Stack', icon: 'pill', accent: '#6D00FF', category: 'nutrition' },
  'streak-counter': { label: 'Streak Counter', icon: 'flame', accent: '#6D00FF', category: 'general' },
  'achievement': { label: 'Achievement', icon: 'trophy', accent: '#6D00FF', category: 'general' },
  'coach-message': { label: 'Coach Message', icon: 'message-circle', accent: '#6D00FF', category: 'general' },
  'sleep-tracker': { label: 'Sleep Tracker', icon: 'moon', accent: '#6D00FF', category: 'wellness' },
  'alert-banner': { label: 'Alert Banner', icon: 'alert-triangle', accent: '#6D00FF', category: 'general' },
  'breathwork': { label: 'Breathwork', icon: 'wind', accent: '#6D00FF', category: 'wellness' },
  'meditation': { label: 'Meditation', icon: 'brain', accent: '#6D00FF', category: 'wellness' },
  'journal': { label: 'Journal', icon: 'book-open', accent: '#6D00FF', category: 'wellness' },
  'video-embed': { label: 'Video Embed', icon: 'play-circle', accent: '#6D00FF', category: 'general' },
  'recipe-card': { label: 'Recipe Card', icon: 'chef-hat', accent: '#6D00FF', category: 'nutrition' },
  'quick-checkin': { label: 'Quick Check-in', icon: 'clipboard-check', accent: '#6D00FF', category: 'wellness' },
  'onboarding-form': { label: 'Onboarding Form', icon: 'user-plus', accent: '#6D00FF', category: 'general' },
  'photo-comparison': { label: 'Photo Comparison', icon: 'camera', accent: '#6D00FF', category: 'progress' },
};

export const TOUCHPOINTS = ['chat', 'dashboard', 'home', 'training', 'nutrition', 'wellness', 'tracking', 'modals'] as const;
export type Touchpoint = (typeof TOUCHPOINTS)[number];
