import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit, AfterViewInit {

  cameras: MediaDeviceInfo[];

  title = 'n1';
  @ViewChild('gameCanvas', {static: true})
  canvas: ElementRef<HTMLCanvasElement>;

  @ViewChild('ownVideo', {static: true})
  ownVideo: ElementRef<HTMLVideoElement>;

  private ctx: CanvasRenderingContext2D;
  ctxWidth = 800;
  ctxHeight = 600;
  channelName: string;


  selectedDeviceId: string;

  ngOnInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d');
  }

  draw(): void {

    this.ctx.font = '100px serif'

    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    let y = this.ctx.canvas.height / 2;
    setInterval(() => {
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
      this.ctx.fillText('😜😂😍', this.ctx.canvas.width / 2, y)
      y += 3;
      if (y >= this.ctx.canvas.height + 15) {
        y = 0
      }
    }, 36)

  }

  ngAfterViewInit(): void {
    this.draw();

    this.getConnectedDevices('videoinput', cameras => {
      this.cameras = cameras;
      console.log('Cameras', this.cameras);
    });

    navigator.mediaDevices.addEventListener('devicechange', event => {
      this.getConnectedDevices('videoinput', cameras => {
        this.cameras = cameras;
        console.log('Devices Changed');
      });
    });
  }

  connect() {

  }


  getConnectedDevices(type, callback) {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const filtered = devices.filter(device => device.kind === type);
        callback(filtered);
      });
  }

  async openCamera() {
    try {
      const constraints = {video: {deviceId: this.selectedDeviceId, resizeMode: 'crop-and-scale'}, audio: {echoCancellation: true}};
      this.ownVideo.nativeElement.srcObject = await navigator.mediaDevices.getUserMedia(constraints);

    } catch (error) {
      console.error('Error opening video camera.', error);
    }

  }
}
