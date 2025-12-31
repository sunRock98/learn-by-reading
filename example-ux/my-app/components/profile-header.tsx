import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Settings } from "lucide-react"

export function ProfileHeader() {
  return (
    <Card className="p-6 mb-8">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Language Learner</h1>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="text-sm">
                Level B1
              </Badge>
              <Badge variant="outline" className="text-sm">
                7 day streak
              </Badge>
            </div>
            <p className="text-muted-foreground">Learning Spanish, French, German, and Italian</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
        <div>
          <p className="text-2xl font-bold">247</p>
          <p className="text-sm text-muted-foreground">Words Learned</p>
        </div>
        <div>
          <p className="text-2xl font-bold">32</p>
          <p className="text-sm text-muted-foreground">Texts Completed</p>
        </div>
        <div>
          <p className="text-2xl font-bold">18h</p>
          <p className="text-sm text-muted-foreground">Time Reading</p>
        </div>
        <div>
          <p className="text-2xl font-bold">4</p>
          <p className="text-sm text-muted-foreground">Languages</p>
        </div>
      </div>
    </Card>
  )
}
