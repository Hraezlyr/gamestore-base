from django.contrib import admin
from .models import HardwareCompatibility, RealidadVirtual


class HardwareCompatibilityInline(admin.TabularInline):
    model = HardwareCompatibility
    extra = 1


@admin.register(RealidadVirtual)
class RealidadVirtualAdmin(admin.ModelAdmin):
    inlines = [HardwareCompatibilityInline]


@admin.register(HardwareCompatibility)
class HardwareCompatibilityAdmin(admin.ModelAdmin):
    list_display = ("game", "visor", "gpu", "compatibility")
    list_filter = ("visor", "gpu", "compatibility")
