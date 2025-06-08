import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApigeeService } from '../../services/apigee.service';

@Component({
  selector: 'app-target-mapping',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './target-mapping.component.html',
  styleUrl: './target-mapping.component.css'
})
export class TargetMappingComponent implements OnInit {
  @Input() mapeoHtml?: string;
  apigeeData: any = null;
  legadoData: any = null;
  mapeoRaw: string | null = null;
  error: string | null = null;

  constructor(private apigeeService: ApigeeService) { }

  getVerbColor(verb: string): string {
    switch (verb.toLowerCase()) {
      case 'get': return 'bg-blue-100 text-blue-800';
      case 'post': return 'bg-green-100 text-green-800';
      case 'put': return 'bg-orange-100 text-orange-800';
      case 'delete': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getVerbBackground(verb: string): string {
    switch (verb.toLowerCase()) {
      case 'get': return 'bg-blue-100';
      case 'post': return 'bg-green-100';
      case 'put': return 'bg-orange-100';
      case 'delete': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  }

  getVerbBorderColor(verb: string): string {
    switch (verb.toLowerCase()) {
      case 'get': return 'border-blue-500';
      case 'post': return 'border-green-500';
      case 'put': return 'border-orange-500';
      case 'delete': return 'border-red-500';
      default: return 'border-gray-500';
    }
  }

  getApigeeCurlCommand(): string {
    if (!this.apigeeData) return '';

    const verb = this.apigeeData.verb?.toUpperCase() || 'GET';

    const envUrlMap: any = {
      prod: 'https://colsubsidio-prod.apigee.net',
      test: 'https://colsubsidio-test.apigee.net'
    };

    const environment = 'test';
    const baseUrl = `${envUrlMap[environment]}/api`;
    const path = this.apigeeData.request.endPoint || '';
    const fullUrl = `${baseUrl}${path}`;

    const headers = this.apigeeData.headers || {
      'Authorization': 'Bearer ZBDmdlxDsCXSIDsGlD0ez1hPzg89'
    };

    let curl = `curl -X '${verb}' \\\n  '${fullUrl}'`;

    for (const key in headers) {
      curl += ` \\\n  -H '${key}: ${headers[key]}'`;
    }

    return curl;
  }

  formatJson(value: any): string {
    return JSON.stringify(value, null, 2);
  }

  ngOnInit(): void {
    this.parseMapeo();
  }

  private parseMapeo(): void {
    if (!this.mapeoHtml) return;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(this.mapeoHtml, 'text/html');
      const cleanText = doc.body.textContent?.trim() || '';

      if (cleanText.startsWith('{') || cleanText.startsWith('[')) {
        const parsed = JSON.parse(cleanText);
        this.apigeeData = this.processMapeoObject(parsed.apigee);
        this.legadoData = this.processMapeoObject(parsed.legado);
      } else {
        this.mapeoRaw = cleanText;
      }
    } catch (e) {
      console.error('Error al interpretar mapeo:', e);
      this.error = 'Error al interpretar el campo de mapeo.';
    }
  }

  private processMapeoObject(data: any): any {
    const detectType = (content: any): string => {
      if (typeof content === 'object') return 'json';
      if (typeof content === 'string') {
        const trimmed = content.trim();
        if (trimmed.startsWith('<') && trimmed.endsWith('>')) return 'xml';
        if (trimmed.startsWith('http')) return 'url';
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json';
      }
      return 'text';
    };

    const safeParseJson = (value: string): any => {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    };

    return {
      ...data,
      request: {
        ...data.request,
        type: detectType(data.request.estructura),
        estructura: safeParseJson(data.request.estructura)
      },
      response: {
        ...data.response,
        type: detectType(data.response.estructura),
        estructura: safeParseJson(data.response.estructura)
      }
    };
  }

  getFormattedContent(data: { type: string, estructura: string }): string {
    if (!data?.estructura) return '';

    let formatted = '';
    switch (data.type) {
      case 'json':
        formatted = this.formatJson(data.estructura);
        break;
      case 'xml':
        formatted = this.formatXml(data.estructura);
        break;
      default:
        formatted = data.estructura;
    }

    return this.escapeHtml(formatted);
  }

  escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  formatXml(xml: string): string {
    const PADDING = '  ';
    const reg = /(>)(<)(\/*)/g;
    let pad = 0;
    xml = xml.replace(reg, '$1\r\n$2$3');
    return xml
      .split('\r\n')
      .map((node) => {
        let indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
          indent = 0;
        } else if (node.match(/^<\/\w/)) {
          if (pad !== 0) pad -= 1;
        } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
          indent = 1;
        }
        const line = PADDING.repeat(pad) + node;
        pad += indent;
        return line;
      })
      .join('\r\n');
  }
}