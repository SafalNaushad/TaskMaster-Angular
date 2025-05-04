import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-dashboard-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 250px;
      width: 100%;
    }
  `]
})
export class DashboardChartComponent implements OnInit, OnChanges {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() chartData: number[] = [];
  @Input() chartLabels: string[] = [];
  @Input() chartType: 'bar' | 'line' | 'pie' | 'doughnut' = 'bar';
  @Input() chartTitle: string = '';
  
  private chart?: Chart;
  
  constructor(private themeService: ThemeService) {}
  
  ngOnInit(): void {
    this.themeService.theme$.subscribe(() => {
      if (this.chart) {
        this.updateChartOptions();
        this.chart.update();
      }
    });
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['chartData'] || changes['chartLabels'] || changes['chartType']) && this.chartCanvas) {
      this.createOrUpdateChart();
    }
  }
  
  ngAfterViewInit(): void {
    this.createOrUpdateChart();
  }
  
  private createOrUpdateChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }
    
    if (!this.chartCanvas) return;
    
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    
    const isDarkMode = this.themeService.isDarkMode();
    const textColor = isDarkMode ? '#e5e7eb' : '#374151';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    const chartColors = [
      '#8b5cf6', // primary-600
      '#14b8a6', // secondary-500
      '#3b82f6', // accent-500
      '#22c55e', // success-500
      '#f59e0b', // warning-500
      '#ef4444', // error-500
    ];
    
    const backgroundColors = this.chartType === 'bar' || this.chartType === 'line' 
      ? chartColors[0] 
      : [chartColors[0], chartColors[1], chartColors[2], chartColors[3], chartColors[4], chartColors[5]];
    
    this.chart = new Chart(ctx, {
      type: this.chartType,
      data: {
        labels: this.chartLabels,
        datasets: [{
          label: this.chartTitle,
          data: this.chartData,
          backgroundColor: backgroundColors,
          borderColor: this.chartType === 'line' ? chartColors[0] : undefined,
          borderWidth: 1,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: this.chartType === 'pie' || this.chartType === 'doughnut',
            position: 'bottom',
            labels: {
              color: textColor
            }
          },
          tooltip: {
            backgroundColor: isDarkMode ? '#374151' : '#ffffff',
            titleColor: isDarkMode ? '#e5e7eb' : '#1f2937',
            bodyColor: isDarkMode ? '#e5e7eb' : '#4b5563',
            borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
            borderWidth: 1
          }
        },
        scales: this.chartType === 'bar' || this.chartType === 'line' ? {
          x: {
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor
            }
          }
        } : undefined
      }
    });
  }
  
  private updateChartOptions(): void {
    if (!this.chart) return;
    
    const isDarkMode = this.themeService.isDarkMode();
    const textColor = isDarkMode ? '#e5e7eb' : '#374151';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Update legend color
    if (this.chart.options.plugins?.legend) {
      this.chart.options.plugins.legend.labels = {
        color: textColor
      };
    }
    
    // Update tooltip colors
    if (this.chart.options.plugins?.tooltip) {
      this.chart.options.plugins.tooltip.backgroundColor = isDarkMode ? '#374151' : '#ffffff';
      this.chart.options.plugins.tooltip.titleColor = isDarkMode ? '#e5e7eb' : '#1f2937';
      this.chart.options.plugins.tooltip.bodyColor = isDarkMode ? '#e5e7eb' : '#4b5563';
      this.chart.options.plugins.tooltip.borderColor = isDarkMode ? '#4b5563' : '#e5e7eb';
    }
    
    // Update scales for bar and line charts
    if ((this.chartType === 'bar' || this.chartType === 'line') && this.chart.options.scales) {
      const scales = this.chart.options.scales as any;
      
      if (scales.x) {
        scales.x.grid = { color: gridColor };
        scales.x.ticks = { color: textColor };
      }
      
      if (scales.y) {
        scales.y.grid = { color: gridColor };
        scales.y.ticks = { color: textColor };
      }
    }
  }
}