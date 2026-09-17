export enum Permission {
  // User
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',

  // Business
  BUSINESS_CREATE = 'business:create',
  BUSINESS_READ = 'business:read',
  BUSINESS_UPDATE = 'business:update',
  BUSINESS_DELETE = 'business:delete',

  // Category
  CATEGORY_CREATE = 'category:create',
  CATEGORY_READ = 'category:read',
  CATEGORY_UPDATE = 'category:update',
  CATEGORY_DELETE = 'category:delete',

  // Follow Up
  FOLLOW_UP_CREATE = 'follow_up:create',
  FOLLOW_UP_READ = 'follow_up:read',
  FOLLOW_UP_UPDATE = 'follow_up:update',
  FOLLOW_UP_DELETE = 'follow_up:delete',

  // Note
  NOTE_CREATE = 'note:create',
  NOTE_READ = 'note:read',
  NOTE_UPDATE = 'note:update',
  NOTE_DELETE = 'note:delete',
}