import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApigeeService, ApigeeKvmResponse, ApigeeTargetServer } from '../../services/apigee.service';


@Component({
  selector: 'resources-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resourcesDetails.component.html',
  styleUrl: './resourcesDetails.component.css'
})
export class ResourcesDetailsComponent implements OnInit {
  @Input() kvmDataJson: string = '';
  @Input() targetServerName!: string;
  targetServer?: ApigeeTargetServer;
  kvmName = '';
  kvmKeys: string[] = [];
  displayData: Array<{ key: string; value: string }> = [];
  error: string | null = null;

  constructor(private apigee: ApigeeService) { }

  ngOnInit(): void {
  this.loadTargetServer();

  if (!this.kvmDataJson) {
    this.error = 'No hay datos de KVM válidos';
    return;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.kvmDataJson, 'text/html');
    const cleanText = doc.body.textContent?.trim() || '';
    const decoded = cleanText.replace(/&quot;/g, '"');
    const parsed = JSON.parse(decoded) as { [name: string]: string[] };

    this.kvmName = Object.keys(parsed)[0];
    this.kvmKeys = parsed[this.kvmName];

    this.apigee.getFullKvm(this.kvmName).subscribe({
      next: resp => {
        this.displayData = resp.entry
          .filter(e => this.kvmKeys.includes(e.name))
          .map(e => ({ key: e.name, value: e.value }));
      },
      error: err => {
        this.error = `Error al cargar KVM "${this.kvmName}": ${err.message}`;
      }
    });
  } catch (e) {
    this.error = 'Formato JSON inválido en Custom.kvm';
  }
}

  private loadTargetServer(): void {
    if (this.targetServerName) {
      this.apigee.getTargetServer(this.targetServerName).subscribe({
        next: (data) => this.targetServer = data,
        error: (err) => this.error = `Error al obtener target server: ${err.message}`
      });
    }
  }
}