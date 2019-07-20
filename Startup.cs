using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ObjectDB {
    public class Startup {
        public Startup(IConfiguration configuration) {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services) {
            services.AddMvc();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env) {
            var provider = new FileExtensionContentTypeProvider {
                Mappings = {
                    [".mjs"] = "application/javascript"
                }
            };

            app.UseHttpsRedirection();
            app.UseStaticFiles(new StaticFileOptions {
                ContentTypeProvider = provider
            });

            app.UseRouting();

            app.UseEndpoints(endpoints => {
                endpoints.MapRazorPages();
            });
        }
    }
}
