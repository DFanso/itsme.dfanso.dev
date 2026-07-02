/**
 * Static port of the `ping` command's markup (index.astro:225-256). The
 * source root was `<div class="command-output ping-animation">`; the
 * `command-output` token is dropped since Terminal.tsx already supplies
 * that wrapper (see About.tsx for the same note), but `ping-animation` is
 * kept — it's what `.ping-animation .ping-line` in app.css targets for the
 * staggered fade-in.
 *
 * `.ping-line` (unlike the flex/gap containers elsewhere in this task) has
 * no `gap` utility, so the single space that a browser renders between
 * adjacent sibling `<span>`s here comes from actual whitespace text in the
 * source, not layout. JSX drops whitespace-only text between sibling
 * elements on separate lines by default, so each such gap is made explicit
 * with `{' '}` to preserve that rendered space.
 */
export function Ping() {
  return (
    <div className="ping-animation">
      <div className="text-[#bb9af7] font-bold mb-2">PING dfanso.dev (192.168.1.1)</div>
      <div className="space-y-1 font-mono">
        <div className="ping-line">
          <span className="text-[#7aa2f7]">64 bytes from dfanso.dev</span>{' '}
          <span className="text-[#565f89]">: icmp_seq=1 ttl=64 time=</span>{' '}
          <span className="text-[#9ece6a]">0.045 ms</span>
        </div>
        <div className="ping-line">
          <span className="text-[#7aa2f7]">64 bytes from dfanso.dev</span>{' '}
          <span className="text-[#565f89]">: icmp_seq=2 ttl=64 time=</span>{' '}
          <span className="text-[#9ece6a]">0.038 ms</span>
        </div>
        <div className="ping-line">
          <span className="text-[#7aa2f7]">64 bytes from dfanso.dev</span>{' '}
          <span className="text-[#565f89]">: icmp_seq=3 ttl=64 time=</span>{' '}
          <span className="text-[#9ece6a]">0.042 ms</span>
        </div>
        <div className="ping-line">
          <span className="text-[#7aa2f7]">64 bytes from dfanso.dev</span>{' '}
          <span className="text-[#565f89]">: icmp_seq=4 ttl=64 time=</span>{' '}
          <span className="text-[#9ece6a]">0.039 ms</span>
        </div>
      </div>
      <div className="mt-4 text-[#c0caf5]">
        <span className="text-[#565f89]">---</span> dfanso.dev ping statistics{' '}
        <span className="text-[#565f89]">---</span>
        <br />
        4 packets transmitted, 4 received, 0% packet loss, time 3ms
        <br />
        rtt min/avg/max = 0.038/0.041/0.045 ms
      </div>
    </div>
  )
}
