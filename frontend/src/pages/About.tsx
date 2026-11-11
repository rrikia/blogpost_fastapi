   import { Link } from 'react-router'

   export default function About() {
     return (
       <div className="space-y-4">
         <h1 className="text-2xl font-semibold">About this project</h1>
         <p className="text-cream">
           A simple blog where users can post, vote and comment for each post. The project was implemented using
           FastAPI and PostgreSQL. Then it was tested with pytest, and deploy it automatically
           with GitHub Actions and Render.
         </p>
         <Link to="/register" className="btn-primary inline-block">Try it: create an account</Link>
       </div>
     )
   }