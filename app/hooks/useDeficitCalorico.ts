"use client";

/**
 * useDeficitCalorico - Hook para gestionar déficit calórico con persistencia
 *
 * Funcionalidades:
 * ✅ Cargar/guardar perfil del usuario (peso, altura, edad, sexo)
 * ✅ Cargar/guardar configuración (nivel actividad, objetivo, peso objetivo)
 * ✅ Registrar actividades diarias con persistencia
 * ✅ Guardar balance calórico diario en histórico
 * ✅ Sincronizar con useHealthSystem para calorías consumidas
 *
 * Estructura en Firestore:
 * users/{uid}/perfilFisico/config
 *   ├─ peso, altura, edad, sexo
 *   ├─ nivelActividad, objetivo, pesoObjetivo
 *   └─ lastUpdate
 *
 * users/{uid}/salud/{date}
 *   ├─ deficitCalorico:
 *   │  ├─ actividades: [{tipo, minutos, id, calorias}]
 *   │  ├─ caloriasQuemadas: number
 *   │  ├─ balance: number (consumidas - quemadas)
 *   │  └─ caloriasTotales: number (ya existe desde nutrición)
 */

import { useState, useEffect } from 'react';
import { doc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getTodayKey } from '../utils/helpers';
import { getSaludDiariaDoc } from '@/lib/firebase-refs';
import { db } from '@/services/firebase/client';
import type { FirebaseUser } from '@/app/types';
import {
  calcularCaloriasQuemadas,
  ActividadesQuemadas
} from '@/app/constants/deficit-calorico';

interface PerfilFisico {
  peso: number;
  altura: number;
  edad: number;
  sexo: 'hombre' | 'mujer';
  nivelActividad: string;
  objetivo: string;
  pesoObjetivo: number;
  lastUpdate: any;
}

interface Actividad {
  id: string | number;
  tipo: string;
  minutos: number;
  calorias?: number;
}

interface DeficitCaloricoData {
  actividades: Actividad[];
  caloriasQuemadas: number;
  balance: number;
}

export default function useDeficitCalorico(user: FirebaseUser | null) {
  // Perfil
  const [peso, setPeso] = useState(75);
  const [altura, setAltura] = useState(175);
  const [edad, setEdad] = useState(30);
  const [sexo, setSexo] = useState<'hombre' | 'mujer'>('hombre');

  // Configuración
  const [nivelActividad, setNivelActividad] = useState('moderado');
  const [objetivo, setObjetivo] = useState('perdida-grasa');
  const [pesoObjetivo, setPesoObjetivo] = useState(75);

  // Actividades del día
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);

  // ============================================================================
  // 1. CARGAR PERFIL DESDE FIRESTORE
  // ============================================================================
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const perfilRef = doc(db, 'users', user.uid, 'perfilFisico', 'config');

    const unsubscribe = onSnapshot(perfilRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as PerfilFisico;
        setPeso(data.peso || 75);
        setAltura(data.altura || 175);
        setEdad(data.edad || 30);
        setSexo(data.sexo || 'hombre');
        setNivelActividad(data.nivelActividad || 'moderado');
        setObjetivo(data.objetivo || 'perdida-grasa');
        setPesoObjetivo(data.pesoObjetivo || 75);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // ============================================================================
  // 2. CARGAR ACTIVIDADES DEL DÍA
  // ============================================================================
  useEffect(() => {
    if (!user) return;

    const todayKey = getTodayKey();
    const dailyRef = getSaludDiariaDoc(user.uid, todayKey);

    const unsubscribe = onSnapshot(dailyRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.deficitCalorico?.actividades) {
          setActividades(data.deficitCalorico.actividades);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  // ============================================================================
  // 3. GUARDAR PERFIL A FIRESTORE
  // ============================================================================
  const guardarPerfil = async () => {
    if (!user) return;

    try {
      const perfilRef = doc(db, 'users', user.uid, 'perfilFisico', 'config');
      await setDoc(perfilRef, {
        peso,
        altura,
        edad,
        sexo,
        nivelActividad,
        objetivo,
        pesoObjetivo,
        lastUpdate: serverTimestamp()
      });
    } catch (error) {
      console.error('Error al guardar perfil:', error);
    }
  };

  // Se guarda cada vez que cambia el perfil
  useEffect(() => {
    if (!loading && user) {
      const timer = setTimeout(guardarPerfil, 500); // Debounce de 500ms
      return () => clearTimeout(timer);
    }
  }, [peso, altura, edad, sexo, nivelActividad, objetivo, pesoObjetivo, user, loading]);

  // ============================================================================
  // 4. AGREGAR ACTIVIDAD
  // ============================================================================
  const agregarActividad = async (tipo: string, minutos: number) => {
    if (!user || minutos <= 0) return;

    try {
      const nuevaActividad: Actividad = {
        id: Date.now(),
        tipo,
        minutos,
        calorias: calcularCaloriasQuemadas(tipo, minutos, peso)
      };

      const nuevasActividades = [...actividades, nuevaActividad];
      const caloriasTotal = nuevasActividades.reduce((sum, a) => sum + (a.calorias || 0), 0);

      const todayKey = getTodayKey();
      const dailyRef = getSaludDiariaDoc(user.uid, todayKey);

      await updateDoc(dailyRef, {
        'deficitCalorico.actividades': nuevasActividades,
        'deficitCalorico.caloriasQuemadas': caloriasTotal,
        lastUpdate: serverTimestamp()
      });
    } catch (error) {
      console.error('Error al agregar actividad:', error);
    }
  };

  // ============================================================================
  // 5. ELIMINAR ACTIVIDAD
  // ============================================================================
  const eliminarActividad = async (id: string | number) => {
    if (!user) return;

    try {
      const nuevasActividades = actividades.filter(a => a.id !== id);
      const caloriasTotal = nuevasActividades.reduce((sum, a) => sum + (a.calorias || 0), 0);

      const todayKey = getTodayKey();
      const dailyRef = getSaludDiariaDoc(user.uid, todayKey);

      await updateDoc(dailyRef, {
        'deficitCalorico.actividades': nuevasActividades,
        'deficitCalorico.caloriasQuemadas': caloriasTotal,
        lastUpdate: serverTimestamp()
      });
    } catch (error) {
      console.error('Error al eliminar actividad:', error);
    }
  };

  // ============================================================================
  // 6. GUARDAR BALANCE DIARIO
  // ============================================================================
  const guardarBalanceDiario = async (caloriasTotales: number) => {
    if (!user) return;

    try {
      const caloriasQuemadas = actividades.reduce((sum, a) => sum + (a.calorias || 0), 0);
      const balance = caloriasTotales - caloriasQuemadas;

      const todayKey = getTodayKey();
      const dailyRef = getSaludDiariaDoc(user.uid, todayKey);

      await updateDoc(dailyRef, {
        'deficitCalorico.balance': balance,
        lastUpdate: serverTimestamp()
      });
    } catch (error) {
      console.error('Error al guardar balance:', error);
    }
  };

  return {
    // Perfil
    peso,
    setPeso,
    altura,
    setAltura,
    edad,
    setEdad,
    sexo,
    setSexo,

    // Configuración
    nivelActividad,
    setNivelActividad,
    objetivo,
    setObjetivo,
    pesoObjetivo,
    setPesoObjetivo,

    // Actividades
    actividades,
    agregarActividad,
    eliminarActividad,

    // Utilidades
    loading,
    guardarBalanceDiario
  };
}
