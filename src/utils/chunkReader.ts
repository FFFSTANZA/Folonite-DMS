export interface ChunkProgress {
  stage: 'preparing' | 'reading' | 'processing' | 'classifying' | 'optimizing' | 'complete';
  currentChunk: number;
  totalChunks: number;
  bytesProcessed: number;
  totalBytes: number;
  percentComplete: number;
  estimatedTimeRemainingMs: number;
  linesProcessed: number;
}

export interface ChunkReaderOptions {
  chunkSize?: number; // Default: 2MB
  onProgress?: (progress: ChunkProgress) => void;
  onChunkProcessed?: (lines: string[], chunkIndex: number) => void;
}

const DEFAULT_CHUNK_SIZE = 2 * 1024 * 1024; // 2MB

export class ChunkReader {
  private file: File;
  private options: Required<ChunkReaderOptions>;
  private startTime: number = 0;
  private linesProcessed: number = 0;

  constructor(file: File, options: ChunkReaderOptions = {}) {
    this.file = file;
    this.options = {
      chunkSize: options.chunkSize || DEFAULT_CHUNK_SIZE,
      onProgress: options.onProgress || (() => {}),
      onChunkProcessed: options.onChunkProcessed || (() => {}),
    };
  }

  /**
   * Calculate estimated time remaining
   */
  private calculateETA(bytesProcessed: number, totalBytes: number): number {
    if (bytesProcessed === 0) return 0;
    
    const elapsedMs = Date.now() - this.startTime;
    const bytesPerMs = bytesProcessed / elapsedMs;
    const remainingBytes = totalBytes - bytesProcessed;
    
    return Math.round(remainingBytes / bytesPerMs);
  }

  /**
   * Report progress
   */
  private reportProgress(
    stage: ChunkProgress['stage'],
    currentChunk: number,
    totalChunks: number,
    bytesProcessed: number
  ): void {
    const progress: ChunkProgress = {
      stage,
      currentChunk,
      totalChunks,
      bytesProcessed,
      totalBytes: this.file.size,
      percentComplete: Math.round((bytesProcessed / this.file.size) * 100),
      estimatedTimeRemainingMs: this.calculateETA(bytesProcessed, this.file.size),
      linesProcessed: this.linesProcessed,
    };

    this.options.onProgress(progress);
  }

  /**
   * Read file in chunks and process line by line
   */
  public async readInChunks(): Promise<string[]> {
    this.startTime = Date.now();
    const totalChunks = Math.ceil(this.file.size / this.options.chunkSize);
    const allLines: string[] = [];
    let leftover = '';

    this.reportProgress('preparing', 0, totalChunks, 0);

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * this.options.chunkSize;
      const end = Math.min(start + this.options.chunkSize, this.file.size);
      const blob = this.file.slice(start, end);

      this.reportProgress('reading', chunkIndex + 1, totalChunks, end);

      // Read chunk as text
      const chunkText = await blob.text();
      
      // Combine with leftover from previous chunk
      const fullText = leftover + chunkText;
      
      // Split into lines
      const lines = fullText.split('\n');
      
      // Keep the last incomplete line for next chunk
      leftover = lines.pop() || '';
      
      // Process complete lines
      this.linesProcessed += lines.length;
      allLines.push(...lines);

      // Notify chunk processed
      this.options.onChunkProcessed(lines, chunkIndex);

      // Small delay to prevent UI blocking
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    // Add the final leftover line if it exists
    if (leftover.trim()) {
      allLines.push(leftover);
      this.linesProcessed++;
    }

    this.reportProgress('complete', totalChunks, totalChunks, this.file.size);

    return allLines;
  }

  /**
   * Process file with streaming and optimization
   */
  public async processWithOptimization<T>(
    lineProcessor: (line: string, index: number) => T | null
  ): Promise<T[]> {
    this.startTime = Date.now();
    const totalChunks = Math.ceil(this.file.size / this.options.chunkSize);
    const results: T[] = [];
    let leftover = '';
    let lineIndex = 0;

    this.reportProgress('preparing', 0, totalChunks, 0);

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * this.options.chunkSize;
      const end = Math.min(start + this.options.chunkSize, this.file.size);
      const blob = this.file.slice(start, end);

      this.reportProgress('processing', chunkIndex + 1, totalChunks, end);

      const chunkText = await blob.text();
      const fullText = leftover + chunkText;
      const lines = fullText.split('\n');
      
      leftover = lines.pop() || '';

      // Process each line
      for (const line of lines) {
        if (line.trim()) {
          const result = lineProcessor(line, lineIndex);
          if (result !== null) {
            results.push(result);
          }
          lineIndex++;
          this.linesProcessed++;
        }
      }

      // Yield to UI
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    // Process final line
    if (leftover.trim()) {
      const result = lineProcessor(leftover, lineIndex);
      if (result !== null) {
        results.push(result);
      }
      this.linesProcessed++;
    }

    this.reportProgress('complete', totalChunks, totalChunks, this.file.size);

    return results;
  }
}

/**
 * Utility function to format bytes
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Utility function to format time
 */
export function formatTime(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.round((ms % 60000) / 1000);
  
  return `${minutes}m ${seconds}s`;
}
