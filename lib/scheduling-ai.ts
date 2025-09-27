import { prisma } from './prisma';
import { realtimeEvents } from './websocket';

export interface SchedulingPreferences {
  workingHours: {
    [key: string]: { start: string; end: string; closed?: boolean };
  };
  bufferTime: number; // minutes between appointments
  maxDailyAppointments: number;
  preferredTechnicians: string[];
  blackoutDates: string[];
  travelTime: number; // minutes for travel between locations
}

export interface AppointmentSuggestion {
  startTime: Date;
  endTime: Date;
  confidence: number;
  technician: {
    id: string;
    name: string;
    skills: string[];
    currentLocation?: string;
  };
  reasoning: string;
  alternatives: Array<{
    startTime: Date;
    endTime: Date;
    confidence: number;
    reason: string;
  }>;
}

export interface OptimizationResult {
  optimized: boolean;
  changes: Array<{
    appointmentId: string;
    oldStartTime: Date;
    newStartTime: Date;
    reason: string;
    impact: 'minimal' | 'moderate' | 'significant';
  }>;
  efficiency: {
    travelTimeReduced: number;
    utilizationImproved: number;
    customerSatisfactionImpact: number;
  };
}

export class SchedulingAI {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  // Find optimal appointment slots
  async findOptimalSlots(
    customerId: string,
    duration: number,
    serviceType: string,
    preferredDates: Date[],
    urgency: 'low' | 'normal' | 'high' | 'emergency' = 'normal'
  ): Promise<AppointmentSuggestion[]> {
    try {
      // Get customer information and preferences
      const customer = await prisma.customer.findUnique({
        where: { id: customerId, organizationId: this.organizationId },
        include: { appointments: { orderBy: { startTime: 'desc' }, take: 5 } }
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Get available technicians with required skills
      const technicians = await this.getQualifiedTechnicians(serviceType);

      // Get organization scheduling preferences
      const organization = await prisma.organization.findUnique({
        where: { id: this.organizationId },
        select: { settings: true }
      });

      const schedulingPrefs = organization?.settings?.scheduling as SchedulingPreferences || this.getDefaultPreferences();

      const suggestions: AppointmentSuggestion[] = [];

      // Generate suggestions for each preferred date
      for (const preferredDate of preferredDates) {
        const dailySuggestions = await this.generateDailySuggestions(
          customer,
          preferredDate,
          duration,
          serviceType,
          technicians,
          schedulingPrefs,
          urgency
        );
        suggestions.push(...dailySuggestions);
      }

      // Sort by confidence and return top suggestions
      return suggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 10);

    } catch (error) {
      console.error('Error finding optimal slots:', error);
      throw error;
    }
  }

  // Optimize existing schedule
  async optimizeSchedule(date: Date): Promise<OptimizationResult> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Get all appointments for the day
      const appointments = await prisma.appointment.findMany({
        where: {
          organizationId: this.organizationId,
          startTime: { gte: startOfDay, lte: endOfDay },
          status: { in: ['SCHEDULED', 'CONFIRMED'] }
        },
        include: {
          customer: { select: { address: true, preferences: true } },
          assignedUser: { select: { id: true, name: true, skills: true } }
        },
        orderBy: { startTime: 'asc' }
      });

      if (appointments.length === 0) {
        return {
          optimized: false,
          changes: [],
          efficiency: { travelTimeReduced: 0, utilizationImproved: 0, customerSatisfactionImpact: 0 }
        };
      }

      // Analyze current schedule efficiency
      const currentEfficiency = await this.analyzeScheduleEfficiency(appointments);

      // Generate optimized schedule
      const optimizedSchedule = await this.generateOptimizedSchedule(appointments);

      // Calculate improvements
      const newEfficiency = await this.analyzeScheduleEfficiency(optimizedSchedule);

      const changes = this.calculateScheduleChanges(appointments, optimizedSchedule);

      return {
        optimized: changes.length > 0,
        changes,
        efficiency: {
          travelTimeReduced: Math.max(0, currentEfficiency.totalTravelTime - newEfficiency.totalTravelTime),
          utilizationImproved: newEfficiency.utilization - currentEfficiency.utilization,
          customerSatisfactionImpact: this.calculateSatisfactionImpact(changes)
        }
      };

    } catch (error) {
      console.error('Error optimizing schedule:', error);
      throw error;
    }
  }

  // Predict optimal technician for a service
  async predictOptimalTechnician(
    customerId: string,
    serviceType: string,
    appointmentTime: Date,
    location: string
  ): Promise<{ technicianId: string; confidence: number; reasoning: string }> {
    try {
      const technicians = await this.getQualifiedTechnicians(serviceType);

      if (technicians.length === 0) {
        throw new Error('No qualified technicians available');
      }

      const scores = await Promise.all(
        technicians.map(tech => this.scoreTechnician(tech, customerId, serviceType, appointmentTime, location))
      );

      const bestMatch = scores.reduce((best, current) => 
        current.score > best.score ? current : best
      );

      return {
        technicianId: bestMatch.technicianId,
        confidence: Math.min(bestMatch.score, 1.0),
        reasoning: bestMatch.reasoning
      };

    } catch (error) {
      console.error('Error predicting optimal technician:', error);
      throw error;
    }
  }

  // Detect scheduling conflicts
  async detectConflicts(
    technicianId: string,
    startTime: Date,
    endTime: Date,
    excludeAppointmentId?: string
  ): Promise<Array<{ appointmentId: string; conflict: string; severity: 'low' | 'medium' | 'high' }>> {
    try {
      const conflicts: Array<{ appointmentId: string; conflict: string; severity: 'low' | 'medium' | 'high' }> = [];

      // Check direct time conflicts
      const timeConflicts = await prisma.appointment.findMany({
        where: {
          organizationId: this.organizationId,
          assignedUserId: technicianId,
          status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
          ...(excludeAppointmentId && { id: { not: excludeAppointmentId } }),
          OR: [
            { startTime: { lte: startTime }, endTime: { gt: startTime } },
            { startTime: { lt: endTime }, endTime: { gte: endTime } },
            { startTime: { gte: startTime }, endTime: { lte: endTime } }
          ]
        },
        include: { customer: { select: { name: true } } }
      });

      timeConflicts.forEach(conflict => {
        conflicts.push({
          appointmentId: conflict.id,
          conflict: `Direct time overlap with ${conflict.customer.name}`,
          severity: 'high'
        });
      });

      // Check travel time conflicts
      const adjacentAppointments = await this.getAdjacentAppointments(technicianId, startTime, endTime, excludeAppointmentId);

      for (const adjacent of adjacentAppointments) {
        const travelTime = await this.calculateTravelTime(adjacent.location, startTime.toString());
        
        if (adjacent.type === 'before' && adjacent.endTime.getTime() + travelTime * 60000 > startTime.getTime()) {
          conflicts.push({
            appointmentId: adjacent.id,
            conflict: `Insufficient travel time from previous appointment (need ${Math.ceil(travelTime)} minutes)`,
            severity: 'medium'
          });
        }
        
        if (adjacent.type === 'after' && endTime.getTime() + travelTime * 60000 > adjacent.startTime.getTime()) {
          conflicts.push({
            appointmentId: adjacent.id,
            conflict: `Insufficient travel time to next appointment (need ${Math.ceil(travelTime)} minutes)`,
            severity: 'medium'
          });
        }
      }

      return conflicts;

    } catch (error) {
      console.error('Error detecting conflicts:', error);
      throw error;
    }
  }

  // Auto-reschedule appointments when conflicts arise
  async autoReschedule(appointmentId: string, reason: string): Promise<{
    success: boolean;
    newStartTime?: Date;
    newEndTime?: Date;
    alternativeTechnician?: string;
    message: string;
  }> {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId, organizationId: this.organizationId },
        include: { customer: true, assignedUser: true }
      });

      if (!appointment) {
        return { success: false, message: 'Appointment not found' };
      }

      // Find alternative slots
      const duration = appointment.estimatedDuration;
      const preferredDates = [
        appointment.startTime,
        new Date(appointment.startTime.getTime() + 24 * 60 * 60 * 1000), // Next day
        new Date(appointment.startTime.getTime() + 48 * 60 * 60 * 1000)  // Day after
      ];

      const suggestions = await this.findOptimalSlots(
        appointment.customerId,
        duration,
        appointment.type,
        preferredDates,
        'normal'
      );

      if (suggestions.length === 0) {
        return { success: false, message: 'No alternative slots available' };
      }

      const bestSuggestion = suggestions[0];

      // Update appointment
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          startTime: bestSuggestion.startTime,
          endTime: bestSuggestion.endTime,
          assignedUserId: bestSuggestion.technician.id,
          notes: `${appointment.notes || ''}\n\nRescheduled: ${reason}`.trim()
        }
      });

      // Emit real-time event
      realtimeEvents.appointmentUpdated(this.organizationId, appointmentId, {
        ...appointment,
        startTime: bestSuggestion.startTime,
        endTime: bestSuggestion.endTime,
        assignedUserId: bestSuggestion.technician.id
      });

      return {
        success: true,
        newStartTime: bestSuggestion.startTime,
        newEndTime: bestSuggestion.endTime,
        alternativeTechnician: bestSuggestion.technician.id !== appointment.assignedUserId ? bestSuggestion.technician.id : undefined,
        message: `Appointment rescheduled to ${bestSuggestion.startTime.toLocaleString()}`
      };

    } catch (error) {
      console.error('Error auto-rescheduling:', error);
      return { success: false, message: 'Failed to reschedule appointment' };
    }
  }

  // Private helper methods
  private async getQualifiedTechnicians(serviceType: string) {
    return await prisma.user.findMany({
      where: {
        organizationId: this.organizationId,
        role: { in: ['USER', 'MANAGER'] },
        status: 'ACTIVE',
        // Add skills-based filtering here when skills field is added to User model
      },
      select: {
        id: true,
        name: true,
        email: true,
        skills: true
      }
    });
  }

  private async generateDailySuggestions(
    customer: any,
    date: Date,
    duration: number,
    serviceType: string,
    technicians: any[],
    preferences: SchedulingPreferences,
    urgency: string
  ): Promise<AppointmentSuggestion[]> {
    const suggestions: AppointmentSuggestion[] = [];
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const workingHours = preferences.workingHours[dayOfWeek];

    if (!workingHours || workingHours.closed) {
      return suggestions;
    }

    // Generate time slots
    const startHour = parseInt(workingHours.start.split(':')[0]);
    const endHour = parseInt(workingHours.end.split(':')[0]);

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = new Date(date);
        startTime.setHours(hour, minute, 0, 0);
        const endTime = new Date(startTime.getTime() + duration * 60000);

        // Check if slot fits within working hours
        if (endTime.getHours() > endHour) continue;

        // Score each technician for this slot
        for (const technician of technicians) {
          const conflicts = await this.detectConflicts(technician.id, startTime, endTime);
          
          if (conflicts.filter(c => c.severity === 'high').length === 0) {
            const confidence = await this.calculateSlotConfidence(
              customer,
              technician,
              startTime,
              serviceType,
              conflicts,
              urgency
            );

            if (confidence > 0.3) { // Only suggest slots with reasonable confidence
              suggestions.push({
                startTime,
                endTime,
                confidence,
                technician,
                reasoning: this.generateReasoning(confidence, conflicts, urgency),
                alternatives: []
              });
            }
          }
        }
      }
    }

    return suggestions.slice(0, 5); // Limit suggestions per day
  }

  private async calculateSlotConfidence(
    customer: any,
    technician: any,
    startTime: Date,
    serviceType: string,
    conflicts: any[],
    urgency: string
  ): Promise<number> {
    let confidence = 1.0;

    // Reduce confidence for conflicts
    conflicts.forEach(conflict => {
      switch (conflict.severity) {
        case 'high': confidence -= 0.5; break;
        case 'medium': confidence -= 0.2; break;
        case 'low': confidence -= 0.1; break;
      }
    });

    // Boost confidence for customer preferences
    const customerPrefs = customer.preferences;
    if (customerPrefs?.preferredTimes) {
      const hour = startTime.getHours();
      if (customerPrefs.preferredTimes.includes(`${hour}:00`)) {
        confidence += 0.2;
      }
    }

    // Boost confidence for technician experience with service type
    // This would be based on historical data
    confidence += 0.1;

    // Adjust for urgency
    switch (urgency) {
      case 'emergency': confidence += 0.3; break;
      case 'high': confidence += 0.2; break;
      case 'low': confidence -= 0.1; break;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  private generateReasoning(confidence: number, conflicts: any[], urgency: string): string {
    const reasons = [];

    if (confidence > 0.8) reasons.push('Optimal time slot');
    else if (confidence > 0.6) reasons.push('Good availability');
    else reasons.push('Available slot');

    if (conflicts.length > 0) {
      reasons.push(`${conflicts.length} minor scheduling consideration${conflicts.length > 1 ? 's' : ''}`);
    } else {
      reasons.push('No scheduling conflicts');
    }

    if (urgency === 'emergency') reasons.push('Emergency priority');
    else if (urgency === 'high') reasons.push('High priority');

    return reasons.join(', ');
  }

  private getDefaultPreferences(): SchedulingPreferences {
    return {
      workingHours: {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' },
        saturday: { start: '10:00', end: '14:00' },
        sunday: { closed: true }
      },
      bufferTime: 15,
      maxDailyAppointments: 8,
      preferredTechnicians: [],
      blackoutDates: [],
      travelTime: 30
    };
  }

  private async scoreTechnician(
    technician: any,
    customerId: string,
    serviceType: string,
    appointmentTime: Date,
    location: string
  ): Promise<{ technicianId: string; score: number; reasoning: string }> {
    let score = 0.5; // Base score
    const reasons = [];

    // Check availability
    const conflicts = await this.detectConflicts(technician.id, appointmentTime, new Date(appointmentTime.getTime() + 60 * 60000));
    if (conflicts.length === 0) {
      score += 0.3;
      reasons.push('Available');
    } else {
      score -= conflicts.length * 0.1;
      reasons.push(`${conflicts.length} conflicts`);
    }

    // Check skills match
    if (technician.skills?.includes(serviceType)) {
      score += 0.2;
      reasons.push('Skilled in service type');
    }

    // Check previous work with customer
    const previousWork = await prisma.appointment.count({
      where: {
        customerId,
        assignedUserId: technician.id,
        status: 'COMPLETED'
      }
    });

    if (previousWork > 0) {
      score += 0.1;
      reasons.push('Previous customer experience');
    }

    return {
      technicianId: technician.id,
      score: Math.max(0, Math.min(1, score)),
      reasoning: reasons.join(', ')
    };
  }

  private async analyzeScheduleEfficiency(appointments: any[]) {
    // Mock implementation - would calculate actual travel times, utilization, etc.
    return {
      totalTravelTime: appointments.length * 15, // Mock: 15 minutes average travel
      utilization: 0.75, // Mock: 75% utilization
      customerSatisfactionScore: 4.2 // Mock score
    };
  }

  private async generateOptimizedSchedule(appointments: any[]) {
    // Mock implementation - would use advanced algorithms to optimize
    return appointments; // Return same for now
  }

  private calculateScheduleChanges(original: any[], optimized: any[]) {
    // Mock implementation - would compare schedules and return changes
    return [];
  }

  private calculateSatisfactionImpact(changes: any[]): number {
    // Mock implementation - would calculate customer satisfaction impact
    return changes.length * -0.1; // Negative impact for changes
  }

  private async getAdjacentAppointments(technicianId: string, startTime: Date, endTime: Date, excludeId?: string) {
    // Mock implementation
    return [];
  }

  private async calculateTravelTime(fromLocation: string, toLocation: string): Promise<number> {
    // Mock implementation - would use Google Maps API or similar
    return 15; // 15 minutes default
  }
}

// Export singleton instance
export const schedulingAI = {
  getInstance: (organizationId: string) => new SchedulingAI(organizationId)
};
