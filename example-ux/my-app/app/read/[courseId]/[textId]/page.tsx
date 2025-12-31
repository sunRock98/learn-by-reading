import { Header } from "@/components/header"
import { InteractiveReader } from "@/components/interactive-reader"
import { ReadingProgress } from "@/components/reading-progress"
import { notFound } from "next/navigation"

const mockTexts = {
  "1": {
    "1": {
      id: "1",
      title: "El Gato y el Ratón",
      content: `Había una vez un gato muy astuto que vivía en una casa grande. El gato siempre intentaba atrapar al ratón pequeño que vivía en un agujero en la pared.

Un día, el ratón decidió ser más inteligente que el gato. Cuando el gato dormía, el ratón salió de su agujero y encontró un pedazo de queso delicioso en la cocina.

El gato despertó y vio al ratón con el queso. Corrió rápidamente hacia él, pero el ratón fue más rápido. El ratón corrió hacia su agujero y se escondió con su queso.

El gato aprendió que no siempre el más grande gana. A veces, la inteligencia es más importante que el tamaño.`,
      language: "Spanish",
      level: "B1",
      courseId: "1",
    },
    "2": {
      id: "2",
      title: "Una Aventura en Madrid",
      content: `María llegó a Madrid por primera vez. La ciudad era enorme y estaba llena de gente. Ella caminó por las calles principales y admiró los edificios históricos.

En la Plaza Mayor, María encontró un café pequeño. Pidió un café con leche y un croissant. El camarero fue muy amable y le recomendó visitar el Parque del Retiro.

Después del café, María tomó el metro hacia el parque. El parque era hermoso, con árboles grandes y un lago tranquilo. Ella alquiló un bote y pasó la tarde navegando.

Al final del día, María estaba cansada pero feliz. Madrid le había robado el corazón.`,
      language: "Spanish",
      level: "B1",
      courseId: "1",
    },
    "3": {
      id: "3",
      title: "La Fiesta de Cumpleaños",
      content: `Hoy es el cumpleaños de Pedro. Él cumple veinticinco años. Sus amigos organizaron una fiesta sorpresa en su apartamento.

Cuando Pedro llegó a casa, todos gritaron "¡Sorpresa!". Pedro estaba muy emocionado y feliz. Había globos de colores, música alegre y mucha comida deliciosa.

Los amigos de Pedro le dieron muchos regalos. Él abrió cada regalo con una sonrisa grande. Su mejor amigo le regaló un libro que Pedro quería leer desde hace mucho tiempo.

La fiesta duró hasta la medianoche. Todos bailaron, rieron y compartieron historias divertidas. Fue una noche inolvidable para Pedro.`,
      language: "Spanish",
      level: "B1",
      courseId: "1",
    },
  },
  "2": {
    "1": {
      id: "1",
      title: "Les Nouvelles Technologies",
      content: `Les technologies modernes changent notre vie quotidienne de manière significative. Les smartphones sont devenus indispensables pour la plupart des gens.

Aujourd'hui, nous pouvons communiquer instantanément avec des personnes du monde entier. Les réseaux sociaux nous permettent de rester connectés avec nos amis et notre famille.

Cependant, ces technologies présentent aussi des défis. Beaucoup de personnes passent trop de temps sur leurs écrans. Il est important de trouver un équilibre entre la vie numérique et la vie réelle.

Les experts recommandent de limiter le temps d'écran et de privilégier les interactions en personne. La technologie doit améliorer notre vie, pas la dominer.`,
      language: "French",
      level: "B2",
      courseId: "2",
    },
  },
}

export default async function ReadPage({
  params,
}: {
  params: Promise<{ courseId: string; textId: string }>
}) {
  const { courseId, textId } = await params
  const text = mockTexts[courseId as keyof typeof mockTexts]?.[textId as keyof (typeof mockTexts)["1"]]

  if (!text) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <ReadingProgress courseId={courseId} textId={textId} />
        <InteractiveReader text={text} />
      </main>
    </div>
  )
}
