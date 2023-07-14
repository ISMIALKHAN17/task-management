import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { RequestService } from 'src/app/services/request.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  loading = false
  chart: any;
  data:any
  @ViewChild('chartCanvasRef', { static: false }) chartCanvasRef!: ElementRef;

  constructor(private req:RequestService){}

  ngOnInit(): void {
    this.loading = true
    this.req.post('task/count',true).subscribe((res:any)=>{
      this.data = res
      this.loading = false
      setTimeout(() => {
        this.initializeChart();
      }, 100);
    })
  }

  ngAfterViewInit(): void {

  }

  initializeChart(): void {
    const data = [this.data.Completed, this.data.Due,this.data.Incomplete,this.data.Disabled]; // Replace with your actual data

    const canvas = this.chartCanvasRef.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Canvas context not available');
      return;
    }

    this.chart = new Chart(context, {
      type: 'pie',
      data: {
        labels: ['Completed ', 'Due' ,'Incomplete','Disabled'], // Replace with your actual labels
        datasets: [{
          data: data,
          backgroundColor: ['#28a745', '#ffc107','#dc3545','#6c757d'] // Replace with your actual colors
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
            text: 'Tasks Overview'
          }
        }
      }
    });

  }
}
