'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';

interface LinkStudentDialogProps {
  parentId: string;
  onSuccess?: () => void;
}

export function LinkStudentDialog({ parentId, onSuccess }: LinkStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [relation, setRelation] = useState('parent');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId.trim()) {
      toast.error('Por favor ingresa el ID del estudiante');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/parents/weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId,
          studentId: studentId.trim(),
          relation,
        }),
      });

      const result = await response.json();

      if (result.ok) {
        toast.success(result.message || 'Estudiante vinculado exitosamente');
        setStudentId('');
        setRelation('parent');
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(result.error || 'Error al vincular estudiante');
      }
    } catch (error) {
      console.error('Error linking student:', error);
      toast.error('Error al vincular estudiante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Vincular Estudiante
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Vincular Estudiante</DialogTitle>
            <DialogDescription>
              Agrega un estudiante para poder ver su progreso académico
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="studentId">ID del Estudiante</Label>
              <Input
                id="studentId"
                placeholder="ej: 123e4567-e89b-12d3-a456-426614174000"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500">
                Solicita este ID al administrador o al estudiante
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="relation">Relación</Label>
              <Select value={relation} onValueChange={setRelation} disabled={loading}>
                <SelectTrigger id="relation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Padre/Madre</SelectItem>
                  <SelectItem value="guardian">Tutor</SelectItem>
                  <SelectItem value="grandparent">Abuelo/a</SelectItem>
                  <SelectItem value="sibling">Hermano/a</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Vinculando...
                </>
              ) : (
                'Vincular'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
