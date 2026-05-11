// Scene persistence utilities for AR Decoration Builder

const SCENES_STORAGE_KEY = 'ar_decoration_scenes';
const MAX_SAVED_SCENES = 10;

export const saveScene = async (sceneName, objects, imageB64, metadata = {}) => {
  try {
    const scenes = JSON.parse(localStorage.getItem(SCENES_STORAGE_KEY) || '[]');

    if (scenes.length >= MAX_SAVED_SCENES) {
      scenes.shift(); // Remove oldest scene
    }

    const scene = {
      id: Date.now(),
      name: sceneName,
      objects,
      imageB64: imageB64 || null,
      createdAt: new Date().toISOString(),
      metadata: {
        objectCount: objects.length,
        ...metadata,
      },
    };

    scenes.push(scene);
    localStorage.setItem(SCENES_STORAGE_KEY, JSON.stringify(scenes));
    return { success: true, scene };
  } catch (err) {
    console.error('Error saving scene:', err);
    return { success: false, error: err.message };
  }
};

export const loadScene = (sceneId) => {
  try {
    const scenes = JSON.parse(localStorage.getItem(SCENES_STORAGE_KEY) || '[]');
    return scenes.find(s => s.id === sceneId) || null;
  } catch (err) {
    console.error('Error loading scene:', err);
    return null;
  }
};

export const listSavedScenes = () => {
  try {
    return JSON.parse(localStorage.getItem(SCENES_STORAGE_KEY) || '[]');
  } catch (err) {
    console.error('Error listing scenes:', err);
    return [];
  }
};

export const deleteScene = (sceneId) => {
  try {
    let scenes = JSON.parse(localStorage.getItem(SCENES_STORAGE_KEY) || '[]');
    scenes = scenes.filter(s => s.id !== sceneId);
    localStorage.setItem(SCENES_STORAGE_KEY, JSON.stringify(scenes));
    return { success: true };
  } catch (err) {
    console.error('Error deleting scene:', err);
    return { success: false, error: err.message };
  }
};

export const exportSceneAsJSON = (scene) => {
  const dataStr = JSON.stringify(scene, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${scene.name}-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const importSceneFromJSON = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const scene = JSON.parse(e.target.result);
        if (scene.objects && Array.isArray(scene.objects)) {
          resolve(scene);
        } else {
          reject(new Error('Invalid scene format'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
