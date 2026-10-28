// Tipos manuales que reflejan backend/prisma/migrations/*.sql (antes
// supabase/migrations/*.sql — carpeta retirada, ver AGENTS.md).

export type EstadoMembresia = 'activa' | 'inactiva'
export type TipoMiembro = 'titular' | 'beneficiario'
export type EstadoInvitacion = 'pendiente' | 'aceptada' | 'expirada' | 'cancelada'
export type EstadoSala = 'activa' | 'expirada' | 'cerrada'
export type ProveedorVideo = 'livekit'

export interface ProfileRow {
  id: string
  email: string
  nombre: string | null
  telefono?: string | null
  role: 'miembro' | 'profesional' | 'admin'
  created_at: string
  updated_at: string
}

export interface MembresiaRow {
  id: string
  titular_user_id: string
  estado: EstadoMembresia
  created_at: string
  updated_at: string
}

export interface MembresiaMiembroRow {
  id: string
  membresia_id: string
  user_id: string
  tipo: TipoMiembro
  created_at: string
}

export interface InvitacionRow {
  id: string
  membresia_id: string
  email_invitado: string
  token: string
  estado: EstadoInvitacion
  fecha_expiracion: string
  invited_by: string
  accepted_by: string | null
  accepted_at: string | null
  created_at: string
}

export interface VideoRoomRow {
  id: string
  slug: string
  room_name: string
  provider: ProveedorVideo
  created_by: string
  status: EstadoSala
  recording_enabled: boolean
  expires_at: string
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: Partial<ProfileRow>
        Update: Partial<ProfileRow>
        Relationships: []
      }
      membresias: {
        Row: MembresiaRow
        Insert: Partial<MembresiaRow>
        Update: Partial<MembresiaRow>
        Relationships: []
      }
      membresia_miembros: {
        Row: MembresiaMiembroRow
        Insert: Partial<MembresiaMiembroRow>
        Update: Partial<MembresiaMiembroRow>
        Relationships: []
      }
      invitaciones: {
        Row: InvitacionRow
        Insert: Partial<InvitacionRow>
        Update: Partial<InvitacionRow>
        Relationships: []
      }
      video_rooms: {
        Row: VideoRoomRow
        Insert: Partial<VideoRoomRow>
        Update: Partial<VideoRoomRow>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      rol: 'miembro' | 'profesional' | 'admin'
      estado_membresia: EstadoMembresia
      tipo_miembro: TipoMiembro
      estado_invitacion: EstadoInvitacion
      estado_sala: EstadoSala
      proveedor_video: ProveedorVideo
    }
    CompositeTypes: Record<string, never>
  }
}
