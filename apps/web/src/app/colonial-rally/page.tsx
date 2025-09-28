'use client';

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
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function ColonialRallyPage() {
  const { t, language } = useTranslation();

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
              <div className="text-3xl font-bold mb-2">3/10</div>
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
              <div className="text-3xl font-bold mb-2">450</div>
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
              <div className="text-3xl font-bold mb-2">#12</div>
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
              <Button className="w-full bg-fuzzy-blue hover:bg-fuzzy-blue/90">
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
              <Button className="w-full bg-fuzzy-green hover:bg-fuzzy-green/90">
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
