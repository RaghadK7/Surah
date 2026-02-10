// src/utils/performanceMonitor.js
import { InteractionManager, Platform } from 'react-native';

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      renderTime: 0,
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      locationUpdates: 0,
      memoryWarnings: 0,
      mapRenders: 0
    };
    
    this.startTime = Date.now();
    this.enableLogging = __DEV__;
  }

  // Track render time
  startRender(componentName) {
    if (!this.enableLogging) return;
    
    return {
      componentName,
      startTime: Date.now()
    };
  }

  endRender(renderContext) {
    if (!this.enableLogging || !renderContext) return;
    
    const renderTime = Date.now() - renderContext.startTime;
    this.metrics.renderTime += renderTime;
    
    if (renderTime > 100) {
      console.warn(`Slow render detected in ${renderContext.componentName}: ${renderTime}ms`);
    }
  }

  // Track API calls
  trackApiCall(apiName, duration, success = true) {
    this.metrics.apiCalls++;
    
    if (this.enableLogging) {
      console.log(`API Call: ${apiName} - ${duration}ms - ${success ? 'SUCCESS' : 'FAILED'}`);
    }
  }

  // Track cache performance
  trackCacheHit(cacheType) {
    this.metrics.cacheHits++;
    
    if (this.enableLogging) {
      console.log(`Cache HIT: ${cacheType}`);
    }
  }

  trackCacheMiss(cacheType) {
    this.metrics.cacheMisses++;
    
    if (this.enableLogging) {
      console.log(`Cache MISS: ${cacheType}`);
    }
  }

  // Track location updates
  trackLocationUpdate(accuracy, speed) {
    this.metrics.locationUpdates++;
    
    if (this.enableLogging && accuracy > 20) {
      console.warn(`Poor GPS accuracy: ${accuracy}m`);
    }
  }

  // Track map renders
  trackMapRender() {
    this.metrics.mapRenders++;
  }

  // Get cache hit ratio
  getCacheHitRatio() {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    return total > 0 ? ((this.metrics.cacheHits / total) * 100).toFixed(2) : 0;
  }

  // Run after interactions for better performance
  scheduleAfterInteractions(callback) {
    InteractionManager.runAfterInteractions(() => {
      callback();
    });
  }

  // Batch operations for better performance
  batchOperation(operations, batchSize = 10) {
    return new Promise((resolve) => {
      let index = 0;
      const results = [];

      const processBatch = () => {
        const batch = operations.slice(index, index + batchSize);
        
        batch.forEach(operation => {
          try {
            results.push(operation());
          } catch (error) {
            console.error('Batch operation error:', error);
          }
        });

        index += batchSize;

        if (index < operations.length) {
          // Schedule next batch
          this.scheduleAfterInteractions(processBatch);
        } else {
          resolve(results);
        }
      };

      processBatch();
    });
  }

  // Get performance report
  getReport() {
    const uptime = Date.now() - this.startTime;
    
    return {
      uptime: `${Math.floor(uptime / 1000)}s`,
      metrics: this.metrics,
      cacheHitRatio: `${this.getCacheHitRatio()}%`,
      avgRenderTime: this.metrics.mapRenders > 0 
        ? `${(this.metrics.renderTime / this.metrics.mapRenders).toFixed(2)}ms` 
        : '0ms',
      platform: Platform.OS,
      timestamp: new Date().toISOString()
    };
  }

  // Log performance report
  logReport() {
    if (this.enableLogging) {
      console.log('=== Performance Report ===');
      console.table(this.getReport());
    }
  }

  // Reset metrics
  reset() {
    this.metrics = {
      renderTime: 0,
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      locationUpdates: 0,
      memoryWarnings: 0,
      mapRenders: 0
    };
    this.startTime = Date.now();
  }

  // Check for performance issues
  checkPerformance() {
    const issues = [];
    const cacheHitRatio = parseFloat(this.getCacheHitRatio());
    
    if (cacheHitRatio < 70) {
      issues.push(`Low cache hit ratio: ${cacheHitRatio}%`);
    }
    
    if (this.metrics.renderTime > 1000) {
      issues.push(`High render time: ${this.metrics.renderTime}ms`);
    }
    
    if (this.metrics.apiCalls > 100) {
      issues.push(`Too many API calls: ${this.metrics.apiCalls}`);
    }
    
    return issues;
  }

  // Auto-report every 5 minutes in development
  startAutoReporting() {
    if (!this.enableLogging) return;
    
    setInterval(() => {
      this.logReport();
      
      const issues = this.checkPerformance();
      if (issues.length > 0) {
        console.warn('Performance Issues Detected:', issues);
      }
    }, 300000); // 5 minutes
  }
}

export const performanceMonitor = new PerformanceMonitor();
export default PerformanceMonitor;