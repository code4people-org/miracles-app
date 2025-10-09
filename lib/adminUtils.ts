import { supabase } from './supabase';

export interface ContentViolation {
  id: string;
  user_id: string;
  content_type: 'miracle' | 'prayer_request';
  violation_type: string;
  flagged_content: string;
  content_id: string;
  created_at: string;
}

export interface ViolationStats {
  total: number;
  byType: Record<string, number>;
  byContentType: Record<string, number>;
  recent: ContentViolation[];
}

export class AdminUtils {
  /**
   * Get all content violations with pagination
   */
  static async getContentViolations(limit: number = 50, offset: number = 0): Promise<ContentViolation[]> {
    const { data, error } = await supabase
      .from('content_violations')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching content violations:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get violation statistics
   */
  static async getViolationStats(): Promise<ViolationStats> {
    const { data: violations, error } = await supabase
      .from('content_violations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching violation stats:', error);
      return { total: 0, byType: {}, byContentType: {}, recent: [] };
    }

    const stats: ViolationStats = {
      total: violations?.length || 0,
      byType: {},
      byContentType: {},
      recent: violations?.slice(0, 10) || []
    };

    // Count by violation type
    violations?.forEach(violation => {
      stats.byType[violation.violation_type] = (stats.byType[violation.violation_type] || 0) + 1;
      stats.byContentType[violation.content_type] = (stats.byContentType[violation.content_type] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get violations for a specific user
   */
  static async getUserViolations(userId: string): Promise<ContentViolation[]> {
    const { data, error } = await supabase
      .from('content_violations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user violations:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get pending content that needs review
   */
  static async getPendingContent(): Promise<any[]> {
    // Get unapproved miracles
    const { data: miracles, error: miraclesError } = await supabase
      .from('miracles')
      .select(`
        id,
        title,
        description,
        category,
        user_id,
        created_at,
        profiles!inner(full_name, email)
      `)
      .eq('is_approved', false)
      .order('created_at', { ascending: false });

    // Get unapproved prayer requests
    const { data: prayers, error: prayersError } = await supabase
      .from('prayer_requests')
      .select(`
        id,
        title,
        description,
        category,
        urgency,
        user_id,
        created_at,
        profiles!inner(full_name, email)
      `)
      .eq('is_approved', false)
      .order('created_at', { ascending: false });

    if (miraclesError || prayersError) {
      console.error('Error fetching pending content:', { miraclesError, prayersError });
      return [];
    }

    const pendingMiracles = (miracles || []).map(miracle => ({
      ...miracle,
      content_type: 'miracle' as const
    }));

    const pendingPrayers = (prayers || []).map(prayer => ({
      ...prayer,
      content_type: 'prayer_request' as const
    }));

    return [...pendingMiracles, ...pendingPrayers].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  /**
   * Approve content
   */
  static async approveContent(contentId: string, contentType: 'miracle' | 'prayer_request'): Promise<boolean> {
    const table = contentType === 'miracle' ? 'miracles' : 'prayer_requests';
    
    const { error } = await supabase
      .from(table)
      .update({ is_approved: true })
      .eq('id', contentId);

    if (error) {
      console.error('Error approving content:', error);
      return false;
    }

    return true;
  }

  /**
   * Reject content and log the reason
   */
  static async rejectContent(
    contentId: string, 
    contentType: 'miracle' | 'prayer_request',
    reason: string,
    userId: string
  ): Promise<boolean> {
    // Log the rejection
    const { error: logError } = await supabase
      .from('content_violations')
      .insert({
        content_id: contentId,
        content_type: contentType,
        violation_type: 'manual_rejection',
        flagged_content: reason,
        user_id: userId
      });

    if (logError) {
      console.error('Error logging rejection:', logError);
    }

    // Delete the content
    const table = contentType === 'miracle' ? 'miracles' : 'prayer_requests';
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .eq('id', contentId);

    if (deleteError) {
      console.error('Error deleting content:', deleteError);
      return false;
    }

    return true;
  }
}
