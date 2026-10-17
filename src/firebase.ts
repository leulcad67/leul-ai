import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with the database ID specified in config if available
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Authentication Helpers
export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  // Persist user record in Firestore
  if (result.user) {
    const userRef = doc(db, 'users', result.user.uid);
    await setDoc(
      userRef,
      {
        userId: result.user.uid,
        displayName: result.user.displayName || 'Anonymous Director',
        email: result.user.email || '',
        photoURL: result.user.photoURL || '',
        lastLogin: new Date().toISOString(),
      },
      { merge: true }
    );
  }
  return result.user;
}

export async function loginAnonymously(): Promise<User> {
  const result = await signInAnonymously(auth);
  return result.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Project Persistence
export interface SavedProject {
  id: string;
  userId: string;
  title: string;
  description?: string;
  aspectRatio: '16:9' | '9:16';
  durationSeconds: number;
  clips: any[];
  textOverlays: any[];
  audioTracks: any[];
  selectedTemplateId?: string;
  colorGrade?: string;
  createdAt?: any;
  updatedAt?: any;
}

export async function saveProjectToFirestore(project: SavedProject): Promise<void> {
  const projectRef = doc(db, 'projects', project.id);
  await setDoc(
    projectRef,
    {
      ...project,
      updatedAt: new Date().toISOString(),
      timestamp: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function loadUserProjectsFromFirestore(userId: string): Promise<SavedProject[]> {
  try {
    const q = query(collection(db, 'projects'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const projects: SavedProject[] = [];
    snapshot.forEach((docSnap) => {
      projects.push(docSnap.data() as SavedProject);
    });
    return projects;
  } catch (err) {
    console.error('Error loading projects from Firestore:', err);
    return [];
  }
}

export async function deleteProjectFromFirestore(projectId: string): Promise<void> {
  await deleteDoc(doc(db, 'projects', projectId));
}

// Custom Templates Persistence
export interface CustomTemplateRecord {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  promptModifier: string;
  colorGrade: string;
  defaultLens: string;
  defaultLighting: string;
  defaultCameraMotion: string;
}

export async function saveCustomTemplateToFirestore(template: CustomTemplateRecord): Promise<void> {
  const templateRef = doc(db, 'templates', template.id);
  await setDoc(templateRef, template, { merge: true });
}

export async function loadCustomTemplatesFromFirestore(): Promise<CustomTemplateRecord[]> {
  try {
    const snapshot = await getDocs(collection(db, 'templates'));
    const templates: CustomTemplateRecord[] = [];
    snapshot.forEach((docSnap) => {
      templates.push(docSnap.data() as CustomTemplateRecord);
    });
    return templates;
  } catch (err) {
    console.error('Error loading custom templates:', err);
    return [];
  }
}
