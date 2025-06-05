import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function RecreuterDashboard() {
  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold mb-6">Recreuter Dashboard</h2>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-2">Post an Internship</h3>
            <p>Create and manage your internship postings for students.</p>
            {/* Add post form/components here */}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-2">Applications</h3>
            <p>View and review student applications in one place.</p>
            {/* Add applications list/components here */}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}