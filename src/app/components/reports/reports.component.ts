import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto'


@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent {
  loading:any = false
  @ViewChild('chartCanvasRef', { static: false }) chartCanvasRef!: ElementRef;
  chart: any;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initializeChart();
  }

  initializeChart(): void {
    const data = [22, 33]; // Replace with your actual data

    const canvas = this.chartCanvasRef.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Canvas context not available');
      return;
    }

    this.chart = new Chart(context, {
      type: 'pie',
      data: {
        labels: ['Data 1', 'Data 2'], // Replace with your actual labels
        datasets: [{
          data: data,
          backgroundColor: ['green', 'red'] // Replace with your actual colors
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Chart.js Pie Chart'
          }
        }
      }
    });

  }
}
