'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Map,
  QrCode,
  Camera,
  Trophy,
  Users,
  Target,
  Compass,
  Award,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

export default function ColonialRallyPage() {
  const { t, language } = useTranslation();
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [scannedQR, setScannedQR] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [progress, setProgress] = useState({
    visited: 3,
    total: 10,
    points: 450,
    rank: 12,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Historical sites data
  const historicalSites = [
    {
      id: 'catedral-primada',
      name: language === 'es' ? 'Catedral Primada' : 'Primada Cathedral',
      description:
        language === 'es'
          ? 'Primera catedral de América'
          : 'First cathedral in the Americas',
      coordinates: { lat: 18.4735, lng: -69.8847 },
      qrCode: 'CATEDRAL_PRIMADA_001',
      status: 'visited' as const,
      points: 150,
    },
    {
      id: 'alcazar-colon',
      name: language === 'es' ? 'Alcázar de Colón' : 'Columbus Alcazar',
      description:
        language === 'es'
          ? 'Residencia del virrey Diego Colón'
          : 'Residence of Viceroy Diego Columbus',
      coordinates: { lat: 18.4742, lng: -69.8841 },
      qrCode: 'ALCAZAR_COLON_002',
      status: 'visited' as const,
      points: 200,
    },
    {
      id: 'fortaleza-ozama',
      name: language === 'es' ? 'Fortaleza Ozama' : 'Ozama Fortress',
      description:
        language === 'es'
          ? 'Primera fortaleza militar de América'
          : 'First military fortress in the Americas',
      coordinates: { lat: 18.475, lng: -69.8835 },
      qrCode: 'FORTALEZA_OZAMA_003',
      status: 'available' as const,
      points: 100,
    },
    {
      id: 'casa-cordon',
      name: language === 'es' ? 'Casa del Cordón' : 'Casa del Cordón',
      description:
        language === 'es'
          ? 'Primera casa de piedra de América'
          : 'First stone house in the Americas',
      coordinates: { lat: 18.4738, lng: -69.8845 },
      qrCode: 'CASA_CORDON_004',
      status: 'locked' as const,
      points: 75,
    },
    {
      id: 'museo-casas-reales',
      name:
        language === 'es'
          ? 'Museo de las Casas Reales'
          : 'Museum of Royal Houses',
      description:
        language === 'es'
          ? 'Antigua sede del gobierno colonial'
          : 'Former colonial government headquarters',
      coordinates: { lat: 18.4745, lng: -69.884 },
      qrCode: 'MUSEO_CASAS_REALES_005',
      status: 'locked' as const,
      points: 125,
    },
    {
      id: 'panteon-nacional',
      name: language === 'es' ? 'Panteón Nacional' : 'National Pantheon',
      description:
        language === 'es'
          ? 'Mausoleo de los héroes nacionales'
          : 'Mausoleum of national heroes',
      coordinates: { lat: 18.4748, lng: -69.8838 },
      qrCode: 'PANTEON_NACIONAL_006',
      status: 'locked' as const,
      points: 175,
    },
  ];

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error(
            language === 'es'
              ? 'No se pudo obtener la ubicación. Permite el acceso a la ubicación para una mejor experiencia.'
              : 'Could not get location. Allow location access for a better experience.',
          );
        },
      );
    }
  }, [language]);

  // QR Scanner functionality
  const startQRScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowQRScanner(true);
        toast.success(
          language === 'es'
            ? 'Cámara activada. Apunta a un código QR.'
            : 'Camera activated. Point at a QR code.',
        );
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error(
        language === 'es'
          ? 'No se pudo acceder a la cámara.'
          : 'Could not access camera.',
      );
    }
  };

  const stopQRScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowQRScanner(false);
  };

  const handleQRScan = () => {
    // Simulate QR code scanning
    const mockQRCode = 'FORTALEZA_OZAMA_003';
    setScannedQR(mockQRCode);

    // Find the site by QR code
    const site = historicalSites.find((site) => site.qrCode === mockQRCode);

    if (site) {
      toast.success(
        language === 'es'
          ? `¡Código QR escaneado! Has visitado ${site.name}`
          : `QR code scanned! You visited ${site.name}`,
      );

      // Update progress
      setProgress((prev) => ({
        ...prev,
        visited: prev.visited + 1,
        points: prev.points + site.points,
      }));

      // Update site status
      const updatedSites = historicalSites.map((s) =>
        s.id === site.id ? { ...s, status: 'visited' as const } : s,
      );

      stopQRScanner();
    } else {
      toast.error(
        language === 'es'
          ? 'Código QR no reconocido. Intenta con otro código.'
          : 'QR code not recognized. Try another code.',
      );
    }
  };

  const openMap = () => {
    setShowMap(true);
    toast.info(
      language === 'es'
        ? 'Mapa abierto. Explora los lugares históricos.'
        : 'Map opened. Explore historical places.',
    );
  };

  const closeMap = () => {
    setShowMap(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Map className="w-8 h-8 text-fuzzy-blue" />
              <h1 className="text-2xl font-bold">
                {language === 'es' ? 'Rally Colonial' : 'Colonial Rally'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Equipos' : 'Teams'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            {language === 'es'
              ? 'Explora la Zona Colonial'
              : 'Explore the Colonial Zone'}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {language === 'es'
              ? 'Descubre la historia de Santo Domingo a través de códigos QR y realidad aumentada'
              : "Discover Santo Domingo's history through QR codes and augmented reality"}
          </p>
        </div>

        {/* Rally Status */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {language === 'es' ? 'Progreso' : 'Progress'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {progress.visited}/{progress.total}
              </div>
              <p className="text-blue-100">
                {language === 'es' ? 'Lugares visitados' : 'Places visited'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                {language === 'es' ? 'Puntos' : 'Points'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{progress.points}</div>
              <p className="text-green-100">
                {language === 'es' ? 'Puntos acumulados' : 'Points earned'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                {language === 'es' ? 'Rango' : 'Rank'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">#{progress.rank}</div>
              <p className="text-purple-100">
                {language === 'es' ? 'En el ranking' : 'In ranking'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="card-hover cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-fuzzy-blue" />
                {language === 'es' ? 'Escanear QR' : 'Scan QR Code'}
              </CardTitle>
              <CardDescription>
                {language === 'es'
                  ? 'Escanea códigos QR en los monumentos históricos'
                  : 'Scan QR codes at historical monuments'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={startQRScanner}
                className="w-full bg-fuzzy-blue hover:bg-fuzzy-blue/90"
              >
                <Camera className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Abrir Cámara' : 'Open Camera'}
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-fuzzy-green" />
                {language === 'es' ? 'Mapa Interactivo' : 'Interactive Map'}
              </CardTitle>
              <CardDescription>
                {language === 'es'
                  ? 'Explora los lugares históricos en el mapa'
                  : 'Explore historical places on the map'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={openMap}
                className="w-full bg-fuzzy-green hover:bg-fuzzy-green/90"
              >
                <Map className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Ver Mapa' : 'View Map'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Historical Sites */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6">
            {language === 'es' ? 'Lugares Históricos' : 'Historical Sites'}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <HistoricalSiteCard
              name={
                language === 'es' ? 'Catedral Primada' : 'Primada Cathedral'
              }
              description={
                language === 'es'
                  ? 'Primera catedral de América'
                  : 'First cathedral in the Americas'
              }
              status="visited"
              points={150}
            />
            <HistoricalSiteCard
              name={language === 'es' ? 'Alcázar de Colón' : 'Columbus Alcazar'}
              description={
                language === 'es'
                  ? 'Residencia del virrey Diego Colón'
                  : 'Residence of Viceroy Diego Columbus'
              }
              status="visited"
              points={200}
            />
            <HistoricalSiteCard
              name={language === 'es' ? 'Fortaleza Ozama' : 'Ozama Fortress'}
              description={
                language === 'es'
                  ? 'Primera fortaleza militar de América'
                  : 'First military fortress in the Americas'
              }
              status="available"
              points={100}
            />
            <HistoricalSiteCard
              name={language === 'es' ? 'Casa del Cordón' : 'Casa del Cordón'}
              description={
                language === 'es'
                  ? 'Primera casa de piedra de América'
                  : 'First stone house in the Americas'
              }
              status="locked"
              points={75}
            />
            <HistoricalSiteCard
              name={
                language === 'es'
                  ? 'Museo de las Casas Reales'
                  : 'Museum of Royal Houses'
              }
              description={
                language === 'es'
                  ? 'Antigua sede del gobierno colonial'
                  : 'Former colonial government headquarters'
              }
              status="locked"
              points={125}
            />
            <HistoricalSiteCard
              name={
                language === 'es' ? 'Panteón Nacional' : 'National Pantheon'
              }
              description={
                language === 'es'
                  ? 'Mausoleo de los héroes nacionales'
                  : 'Mausoleum of national heroes'
              }
              status="locked"
              points={175}
            />
          </div>
        </div>
      </main>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {language === 'es' ? 'Escáner QR' : 'QR Scanner'}
              </h3>
              <Button onClick={stopQRScanner} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 bg-gray-100 rounded-lg"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-white rounded-lg w-48 h-48 flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-white opacity-50" />
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Button
                onClick={handleQRScan}
                className="w-full bg-fuzzy-blue hover:bg-fuzzy-blue/90"
              >
                <Camera className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Simular Escaneo' : 'Simulate Scan'}
              </Button>
              <p className="text-sm text-gray-600 text-center">
                {language === 'es'
                  ? 'Apunta la cámara a un código QR del monumento'
                  : 'Point the camera at a monument QR code'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {language === 'es' ? 'Mapa Interactivo' : 'Interactive Map'}
              </h3>
              <Button onClick={closeMap} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Map Placeholder */}
              <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                <div className="text-center">
                  <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    {language === 'es'
                      ? 'Mapa de la Zona Colonial'
                      : 'Colonial Zone Map'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {language === 'es'
                      ? 'Integración con Google Maps o OpenStreetMap'
                      : 'Google Maps or OpenStreetMap integration'}
                  </p>
                </div>
              </div>

              {/* Sites List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <h4 className="font-semibold text-lg">
                  {language === 'es'
                    ? 'Lugares Históricos'
                    : 'Historical Sites'}
                </h4>
                {historicalSites.map((site, index) => (
                  <div
                    key={site.id}
                    className={`p-4 rounded-lg border-2 ${
                      site.status === 'visited'
                        ? 'border-green-200 bg-green-50'
                        : site.status === 'available'
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-semibold">{site.name}</h5>
                        <p className="text-sm text-gray-600 mb-2">
                          {site.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-fuzzy-yellow" />
                          <span className="text-sm font-medium">
                            {site.points} pts
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            site.status === 'visited'
                              ? 'bg-green-100 text-green-800'
                              : site.status === 'available'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {site.status === 'visited'
                            ? language === 'es'
                              ? 'Visitado'
                              : 'Visited'
                            : site.status === 'available'
                              ? language === 'es'
                                ? 'Disponible'
                                : 'Available'
                              : language === 'es'
                                ? 'Bloqueado'
                                : 'Locked'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoricalSiteCard({
  name,
  description,
  status,
  points,
}: {
  name: string;
  description: string;
  status: 'visited' | 'available' | 'locked';
  points: number;
}) {
  const getStatusColor = () => {
    switch (status) {
      case 'visited':
        return 'bg-green-100 text-green-800';
      case 'available':
        return 'bg-blue-100 text-blue-800';
      case 'locked':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'visited':
        return 'Visitado';
      case 'available':
        return 'Disponible';
      case 'locked':
        return 'Bloqueado';
    }
  };

  return (
    <Card
      className={`${status === 'locked' ? 'opacity-60' : 'card-hover cursor-pointer'}`}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{name}</CardTitle>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
          >
            {getStatusText()}
          </span>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-fuzzy-yellow" />
            <span className="text-sm font-medium">{points} pts</span>
          </div>
          {status === 'available' && (
            <Button size="sm" className="bg-fuzzy-blue hover:bg-fuzzy-blue/90">
              Visitar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
