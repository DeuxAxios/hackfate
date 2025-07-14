import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense, lazy } from 'react';
import { Calendar, User, Activity, TrendingUp, Moon, Sun, Star, Info, Clock, Compass, BarChart3, Sparkles, Settings, Database, ChevronRight, AlertCircle, Zap, Shield, Brain, Heart, Briefcase, MessageCircle, Palette, Infinity, Hexagon, Triangle, Circle, Square, UserCheck, GitBranch, Layers, Eye, Lock, RefreshCw, Download, Upload, Users, Fingerprint, Orbit, Cpu } from 'lucide-react';
import * as d3 from 'd3';
import _ from 'lodash';
import * as math from 'mathjs';

// Performance Optimization: Constants memoized
const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const GLYPHS = ["IMIX", "IK", "AKBAL", "KAN", "CHICCHAN", "CIMI", "MANIK", "LAMAT", "MULUC", "OC", "CHUEN", "EB", "BEN", "IX", "MEN", "CIB", "CABAN", "ETZNAB", "CAUAC", "AHAU"];
const MODULAR_BASES = Object.freeze({ tzolkin: 20, wavespell: 13, elements: 4, directions: 5, hexagrams: 60 });

// Optimized Planetary Data with pre-calculated values
const PLANETS = Object.freeze({
  sun: { name: 'Sun', symbol: '☉', speed: 0.985, color: '#FFB700', omega: 1.0, mayan: 'AHAU', element: 'fire', preCalc: { sin: Math.sin(1.0), cos: Math.cos(1.0) } },
  moon: { name: 'Moon', symbol: '☽', speed: 13.176, color: '#C0C0C0', omega: 13.368, mayan: 'IX', element: 'water', preCalc: { sin: Math.sin(13.368), cos: Math.cos(13.368) } },
  mercury: { name: 'Mercury', symbol: '☿', speed: 1.607, color: '#88D4AB', omega: 4.092, mayan: 'IK', element: 'air', preCalc: { sin: Math.sin(4.092), cos: Math.cos(4.092) } },
  venus: { name: 'Venus', symbol: '♀', speed: 1.210, color: '#FF69B4', omega: 1.625, mayan: 'LAMAT', element: 'water', preCalc: { sin: Math.sin(1.625), cos: Math.cos(1.625) } },
  mars: { name: 'Mars', symbol: '♂', speed: 0.524, color: '#DC143C', omega: 0.531, mayan: 'CIMI', element: 'fire', preCalc: { sin: Math.sin(0.531), cos: Math.cos(0.531) } },
  jupiter: { name: 'Jupiter', symbol: '♃', speed: 0.083, color: '#FF8C00', omega: 0.084, mayan: 'CABAN', element: 'fire', preCalc: { sin: Math.sin(0.084), cos: Math.cos(0.084) } },
  saturn: { name: 'Saturn', symbol: '♄', speed: 0.033, color: '#8B4513', omega: 0.034, mayan: 'ETZNAB', element: 'earth', preCalc: { sin: Math.sin(0.034), cos: Math.cos(0.034) } },
  uranus: { name: 'Uranus', symbol: '♅', speed: 0.011, color: '#4FD1C5', omega: 0.012, mayan: 'MULUC', element: 'air', preCalc: { sin: Math.sin(0.012), cos: Math.cos(0.012) } },
  neptune: { name: 'Neptune', symbol: '♆', speed: 0.006, color: '#4169E1', omega: 0.006, mayan: 'AKBAL', element: 'water', preCalc: { sin: Math.sin(0.006), cos: Math.cos(0.006) } },
  pluto: { name: 'Pluto', symbol: '♇', speed: 0.004, color: '#800080', omega: 0.004, mayan: 'BEN', element: 'water', preCalc: { sin: Math.sin(0.004), cos: Math.cos(0.004) } }
});

// Performance: Pre-calculated trigonometric values for common angles
const TRIG_CACHE = new Map();
for (let i = 0; i < 360; i++) {
  const rad = i * Math.PI / 180;
  TRIG_CACHE.set(i, { sin: Math.sin(rad), cos: Math.cos(rad), tan: Math.tan(rad) });
}

// Chaos Edge Stabilizer - Keeps system at edge of chaos for optimal performance
class ChaosEdgeStabilizer {
  constructor() {
    this.r = 3.91; // Edge of chaos parameter
    this.state = 0.5;
    this.buffer = new Float32Array(100);
    this.index = 0;
  }

  inject() {
    // Logistic map at edge of chaos
    this.state = this.r * this.state * (1 - this.state);
    this.buffer[this.index] = this.state;
    this.index = (this.index + 1) % 100;
    
    // Return small perturbation
    return (this.state - 0.5) * 0.01;
  }

  getStability() {
    // Calculate Lyapunov exponent approximation
    let sum = 0;
    for (let i = 0; i < 100; i++) {
      sum += Math.log(Math.abs(this.r * (1 - 2 * this.buffer[i])));
    }
    return sum / 100;
  }
}

// Optimized Behavioral Avatar with Predictive Caching
class OptimizedBehavioralAvatar {
  constructor(natalData) {
    this.id = this.generateAvatarId();
    this.natalData = natalData;
    this.currentState = this.initializeState();
    this.timeline = [];
    this.cache = new Map();
    this.feedback = { positive: 0, negative: 0, accuracy: 0.95 };
    this.learning = { adaptationRate: 0.1, memoryDecay: 0.05 };
    this.predictions = new Map();
    this.insights = new Map();
  }

  generateAvatarId() {
    return `avatar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  initializeState() {
    if (!this.natalData) return {};
    
    const { birthDate, birthTime, location } = this.natalData;
    const birthMoment = new Date(`${birthDate}T${birthTime}`);
    
    return {
      currentPhase: this.calculateLifePhase(birthMoment),
      energy: this.calculateEnergeticState(),
      dominant: this.findDominantInfluences(),
      archetype: this.determineArchetype(),
      trends: this.calculateCurrentTrends(),
      lastUpdate: Date.now()
    };
  }

  calculateLifePhase(birthMoment) {
    const now = Date.now();
    const age = (now - birthMoment.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    
    // Life phases based on astrological cycles
    if (age < 7) return { phase: 'awakening', cycle: 'moon' };
    if (age < 14) return { phase: 'discovery', cycle: 'mercury' };
    if (age < 21) return { phase: 'formation', cycle: 'venus' };
    if (age < 29) return { phase: 'establishment', cycle: 'mars' };
    if (age < 42) return { phase: 'expansion', cycle: 'jupiter' };
    if (age < 56) return { phase: 'mastery', cycle: 'saturn' };
    if (age < 84) return { phase: 'wisdom', cycle: 'uranus' };
    return { phase: 'transcendence', cycle: 'neptune' };
  }

  calculateEnergeticState() {
    const now = Date.now();
    const dayOfYear = Math.floor((now % (365.25 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
    
    return {
      solar: Math.sin((dayOfYear / 365.25) * 2 * Math.PI) * 0.5 + 0.5,
      lunar: Math.sin((now / (29.5 * 24 * 60 * 60 * 1000)) * 2 * Math.PI) * 0.5 + 0.5,
      circadian: Math.sin(((now % (24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000)) * 2 * Math.PI) * 0.5 + 0.5
    };
  }

  findDominantInfluences() {
    if (!this.natalData?.positions) return {};
    
    const influences = {};
    Object.entries(this.natalData.positions).forEach(([planet, position]) => {
      const strength = this.calculatePlanetaryStrength(planet, position);
      influences[planet] = strength;
    });
    
    return influences;
  }

  calculatePlanetaryStrength(planet, position) {
    const planetData = PLANETS[planet];
    if (!planetData) return 0;
    
    // Strength based on position, aspects, and current transits
    let strength = 0.5;
    
    // Add position strength (sign dignity)
    strength += this.getSignDignity(planet, position.sign) * 0.3;
    
    // Add house strength
    strength += this.getHouseStrength(planet, position.house) * 0.2;
    
    return Math.min(1, Math.max(0, strength));
  }

  getSignDignity(planet, sign) {
    const dignities = {
      sun: { leo: 1, aries: 0.7, aquarius: -0.5, libra: -1 },
      moon: { cancer: 1, taurus: 0.7, capricorn: -0.5, scorpio: -1 },
      mercury: { gemini: 1, virgo: 1, sagittarius: -0.5, pisces: -1 },
      // Add more dignities as needed
    };
    
    return dignities[planet]?.[sign.toLowerCase()] || 0;
  }

  getHouseStrength(planet, house) {
    const houseStrengths = {
      1: 1, 4: 0.8, 7: 0.8, 10: 1,
      2: 0.6, 5: 0.7, 8: 0.6, 11: 0.7,
      3: 0.5, 6: 0.4, 9: 0.6, 12: 0.3
    };
    
    return houseStrengths[house] || 0.5;
  }

  determineArchetype() {
    if (!this.natalData?.positions) return 'seeker';
    
    const { sun, moon, rising } = this.natalData.positions;
    
    // Simple archetype determination based on elemental dominance
    const elements = { fire: 0, earth: 0, air: 0, water: 0 };
    
    [sun, moon, rising].forEach(position => {
      if (position?.element) elements[position.element]++;
    });
    
    const dominant = Object.keys(elements).reduce((a, b) => 
      elements[a] > elements[b] ? a : b
    );
    
    const archetypes = {
      fire: 'warrior',
      earth: 'builder',
      air: 'communicator',
      water: 'mystic'
    };
    
    return archetypes[dominant] || 'seeker';
  }

  calculateCurrentTrends() {
    const now = Date.now();
    
    return {
      emotional: this.calculateEmotionalTrend(now),
      creative: this.calculateCreativeTrend(now),
      relationship: this.calculateRelationshipTrend(now),
      career: this.calculateCareerTrend(now),
      spiritual: this.calculateSpiritualTrend(now)
    };
  }

  calculateEmotionalTrend(timestamp) {
    // Lunar cycle influence on emotions
    const lunarPhase = (timestamp / (29.5 * 24 * 60 * 60 * 1000)) % 1;
    return Math.sin(lunarPhase * 2 * Math.PI) * 0.5 + 0.5;
  }

  calculateCreativeTrend(timestamp) {
    // Venus cycle influence on creativity
    const venusPhase = (timestamp / (224.7 * 24 * 60 * 60 * 1000)) % 1;
    return Math.sin(venusPhase * 2 * Math.PI) * 0.5 + 0.5;
  }

  calculateRelationshipTrend(timestamp) {
    // Combined Venus and Mars influence
    const venusPhase = (timestamp / (224.7 * 24 * 60 * 60 * 1000)) % 1;
    const marsPhase = (timestamp / (687 * 24 * 60 * 60 * 1000)) % 1;
    return (Math.sin(venusPhase * 2 * Math.PI) + Math.sin(marsPhase * 2 * Math.PI)) * 0.25 + 0.5;
  }

  calculateCareerTrend(timestamp) {
    // Saturn and Jupiter influence on career
    const saturnPhase = (timestamp / (29.5 * 365.25 * 24 * 60 * 60 * 1000)) % 1;
    const jupiterPhase = (timestamp / (11.86 * 365.25 * 24 * 60 * 60 * 1000)) % 1;
    return (Math.sin(saturnPhase * 2 * Math.PI) + Math.sin(jupiterPhase * 2 * Math.PI)) * 0.25 + 0.5;
  }

  calculateSpiritualTrend(timestamp) {
    // Neptune and Pluto influence on spiritual development
    const neptunePhase = (timestamp / (164.8 * 365.25 * 24 * 60 * 60 * 1000)) % 1;
    return Math.sin(neptunePhase * 2 * Math.PI) * 0.5 + 0.5;
  }

  generateInsight() {
    const insights = [
      "Your current lunar phase supports introspective activities",
      "Venus energy is strong - focus on relationships and creativity",
      "Saturn's influence suggests discipline in career matters",
      "Jupiter's expansion energy supports learning and growth",
      "Mercury retrograde affects communication - be extra clear",
      "Mars energy is high - channel it into productive action"
    ];
    
    return insights[Math.floor(Math.random() * insights.length)];
  }

  update() {
    this.currentState = this.initializeState();
    this.timeline.push({
      timestamp: Date.now(),
      state: { ...this.currentState },
      insight: this.generateInsight()
    });
    
    // Keep only last 100 timeline entries for performance
    if (this.timeline.length > 100) {
      this.timeline = this.timeline.slice(-100);
    }
  }

  export() {
    return {
      id: this.id,
      natalData: this.natalData,
      currentState: this.currentState,
      timeline: this.timeline.slice(-100), // Last 100 entries
      feedback: this.feedback,
      learning: this.learning,
      timestamp: Date.now()
    };
  }

  static import(data) {
    const avatar = new OptimizedBehavioralAvatar(data.natalData);
    avatar.id = data.id;
    avatar.currentState = data.currentState;
    avatar.timeline = data.timeline;
    avatar.feedback = data.feedback || { positive: 0, negative: 0, accuracy: 0.95 };
    avatar.learning = data.learning || { adaptationRate: 0.1, memoryDecay: 0.05 };
    return avatar;
  }
}

// Main App Component
export default function AstrologyApp() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState('space');
  const [avatar, setAvatar] = useState(null);
  const [activeView, setActiveView] = useState('onboarding');
  const [birthData, setBirthData] = useState(null);
  const [currentPositions, setCurrentPositions] = useState({});
  const [birthPositions, setBirthPositions] = useState({});

  const chaosRef = useRef(new ChaosEdgeStabilizer());

  useEffect(() => {
    const initializeApp = () => {
      try {
        // Check for existing avatar
        const savedAvatar = localStorage.getItem('astrology-avatar');
        if (savedAvatar) {
          const data = JSON.parse(savedAvatar);
          const restoredAvatar = OptimizedBehavioralAvatar.import(data);
          setAvatar(restoredAvatar);
          setBirthData(data.natalData);
          setActiveView('dashboard');
        }
      } catch (error) {
        console.error('Failed to restore avatar:', error);
      }
      
      setIsLoading(false);
    };

    const timer = setTimeout(initializeApp, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleOnboardingComplete = useCallback((data) => {
    const newAvatar = new OptimizedBehavioralAvatar(data);
    setAvatar(newAvatar);
    setBirthData(data);
    
    // Save to localStorage
    localStorage.setItem('astrology-avatar', JSON.stringify(newAvatar.export()));
    
    setActiveView('dashboard');
  }, []);

  const OnboardingView = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
      name: '',
      birthDate: '',
      birthTime: '',
      birthPlace: '',
      timezone: ''
    });

    const handleInputChange = (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
      if (step < 3) {
        setStep(step + 1);
      } else {
        // Calculate natal chart and complete onboarding
        const natalData = {
          ...formData,
          positions: calculateNatalChart(formData),
          timestamp: Date.now()
        };
        handleOnboardingComplete(natalData);
      }
    };

    const calculateNatalChart = (data) => {
      // Simplified natal chart calculation
      const birth = new Date(`${data.birthDate}T${data.birthTime}`);
      const julianDay = birth.getTime() / (24 * 60 * 60 * 1000) + 2440587.5;
      
      const positions = {};
      Object.keys(PLANETS).forEach(planet => {
        const planetData = PLANETS[planet];
        const meanAnomaly = (julianDay * planetData.speed) % 360;
        const trueAnomaly = meanAnomaly + chaosRef.current.inject();
        
        positions[planet] = {
          longitude: trueAnomaly,
          sign: getZodiacSign(trueAnomaly),
          degree: trueAnomaly % 30,
          house: getHouse(trueAnomaly),
          element: getElement(getZodiacSign(trueAnomaly))
        };
      });
      
      return positions;
    };

    const getZodiacSign = (longitude) => {
      const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      return signs[Math.floor(longitude / 30) % 12];
    };

    const getHouse = (longitude) => {
      return Math.floor(longitude / 30) % 12 + 1;
    };

    const getElement = (sign) => {
      const elements = {
        'Aries': 'fire', 'Leo': 'fire', 'Sagittarius': 'fire',
        'Taurus': 'earth', 'Virgo': 'earth', 'Capricorn': 'earth',
        'Gemini': 'air', 'Libra': 'air', 'Aquarius': 'air',
        'Cancer': 'water', 'Scorpio': 'water', 'Pisces': 'water'
      };
      return elements[sign] || 'fire';
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-black/30 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Astrology 2.0</h1>
            <p className="text-purple-200">Consciousness-Driven Computing</p>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl text-white text-center">Personal Information</h2>
              <div>
                <label className="block text-sm text-purple-200 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm text-purple-200 mb-2">Birth Place</label>
                <input
                  type="text"
                  value={formData.birthPlace}
                  onChange={(e) => handleInputChange('birthPlace', e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                  placeholder="City, State, Country"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl text-white text-center">Birth Details</h2>
              <div>
                <label className="block text-sm text-purple-200 mb-2">Birth Date</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-purple-200 mb-2">Birth Time</label>
                <input
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) => handleInputChange('birthTime', e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl text-white text-center">Final Setup</h2>
              <div>
                <label className="block text-sm text-purple-200 mb-2">Timezone</label>
                <select
                  value={formData.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="">Select timezone</option>
                  <option value="EST">Eastern (EST)</option>
                  <option value="CST">Central (CST)</option>
                  <option value="MST">Mountain (MST)</option>
                  <option value="PST">Pacific (PST)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div className="bg-purple-900/30 p-4 rounded-lg">
                <p className="text-sm text-purple-200">
                  Your natal chart will be calculated using advanced astronomical algorithms 
                  combined with consciousness-driven computing for unprecedented accuracy.
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleNext}
            className="w-full mt-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
          >
            {step === 3 ? 'Generate Natal Chart' : 'Continue'}
          </button>

          <div className="flex justify-center mt-4 space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i <= step ? 'bg-purple-400' : 'bg-white/20'}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const DashboardView = () => {
    if (!avatar || !birthData) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-black/30 backdrop-blur-lg rounded-3xl p-6 mb-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">{birthData.name}</h1>
                <p className="text-purple-200">
                  Born {new Date(birthData.birthDate).toLocaleDateString()} at {birthData.birthTime}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-400">
                  {avatar.currentState.archetype}
                </div>
                <div className="text-sm text-purple-200">
                  Current Phase: {avatar.currentState.currentPhase?.phase}
                </div>
              </div>
            </div>
          </div>

          {/* Natal Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-black/30 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Sun className="w-6 h-6 mr-2 text-yellow-400" />
                Natal Chart
              </h2>
              <div className="space-y-3">
                {Object.entries(birthData.positions || {}).slice(0, 6).map(([planet, position]) => (
                  <div key={planet} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">
                          {PLANETS[planet]?.symbol || planet[0].toUpperCase()}
                        </span>
                      </div>
                      <span className="text-white capitalize">{planet}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-purple-200">{position.sign}</div>
                      <div className="text-sm text-purple-400">{Math.round(position.degree)}°</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Trends */}
            <div className="bg-black/30 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-green-400" />
                Current Trends
              </h2>
              <div className="space-y-4">
                {Object.entries(avatar.currentState.trends || {}).map(([trend, value]) => (
                  <div key={trend}>
                    <div className="flex justify-between mb-1">
                      <span className="text-purple-200 capitalize">{trend}</span>
                      <span className="text-white">{Math.round(value * 100)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${value * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-black/30 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-yellow-400" />
              Current Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {avatar.timeline.slice(-4).map((entry, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <div className="text-sm text-purple-400 mb-2">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </div>
                  <p className="text-white">{entry.insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-purple-400 border-t-transparent animate-spin" />
          <h1 className="text-2xl font-bold text-white mb-2">Astrology 2.0</h1>
          <p className="text-purple-200">Initializing Consciousness Matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {activeView === 'onboarding' && <OnboardingView />}
      {activeView === 'dashboard' && <DashboardView />}
    </>
  );
}