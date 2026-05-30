import { redirect } from 'next/navigation'

/** El catálogo de prendas solo se muestra en la pantalla de inicio */
export default function CatalogoPage() {
  redirect('/#catalogo')
}
