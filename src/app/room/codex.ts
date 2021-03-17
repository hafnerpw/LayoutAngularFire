export class codex {
  preferCodec(sdp, codecName) {
    var info = this.splitLines(sdp);

    if (!info.videoCodecNumbers) {
      return sdp;
    }

    if (codecName === 'vp8' && info.vp8LineNumber === info.videoCodecNumbers[0]) {
      return sdp;
    }

    if (codecName === 'vp9' && info.vp9LineNumber === info.videoCodecNumbers[0]) {
      return sdp;
    }

    if (codecName === 'h264' && info.h264LineNumber === info.videoCodecNumbers[0]) {
      return sdp;
    }

    sdp = this.preferCodecHelper(sdp, codecName, info, null);

    return sdp;
  }


  preferCodecHelper(sdp, codec, info, ignore) {
    var preferCodecNumber = '';

    if (codec === 'vp8') {
      if (!info.vp8LineNumber) {
        return sdp;
      }
      preferCodecNumber = info.vp8LineNumber;
    }

    if (codec === 'vp9') {
      if (!info.vp9LineNumber) {
        return sdp;
      }
      preferCodecNumber = info.vp9LineNumber;
    }

    if (codec === 'h264') {
      if (!info.h264LineNumber) {
        return sdp;
      }

      preferCodecNumber = info.h264LineNumber;
    }

    var newLine = info.videoCodecNumbersOriginal.split('SAVPF')[0] + 'SAVPF ';

    var newOrder = [preferCodecNumber];

    if (ignore) {
      newOrder = [];
    }

    info.videoCodecNumbers.forEach(function(codecNumber) {
      if (codecNumber === preferCodecNumber) return;
      newOrder.push(codecNumber);
    });

    newLine += newOrder.join(' ');

    sdp = sdp.replace(info.videoCodecNumbersOriginal, newLine);
    return sdp;
  }


  splitLines(sdp) {
    var info: any = {};
    sdp.split('\n').forEach(function(line) {
      if (line.indexOf('m=video') === 0) {
        info.videoCodecNumbers = [];
        line.split('SAVPF')[1].split(' ').forEach(function(codecNumber) {
          codecNumber = codecNumber.trim();
          if (!codecNumber || !codecNumber.length) return;
          info.videoCodecNumbers.push(codecNumber);
          info.videoCodecNumbersOriginal = line;
        });
      }

      if (line.indexOf('VP8/90000') !== -1 && !info.vp8LineNumber) {
        info.vp8LineNumber = line.replace('a=rtpmap:', '').split(' ')[0];
      }

      if (line.indexOf('VP9/90000') !== -1 && !info.vp9LineNumber) {
        info.vp9LineNumber = line.replace('a=rtpmap:', '').split(' ')[0];
      }

      if (line.indexOf('H264/90000') !== -1 && !info.h264LineNumber) {
        info.h264LineNumber = line.replace('a=rtpmap:', '').split(' ')[0];
      }
    });

    return info;
  }

  static guid(): string {
    return (
      this.s4() +
      this.s4() +
      '-' +
      this.s4() +
      '-' +
      this.s4() +
      '-' +
      this.s4() +
      '-' +
      this.s4() +
      this.s4() +
      this.s4()
    );
  }

  private static s4(): string {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

}
