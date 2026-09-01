sed -i '/<div className="hidden lg:flex items-center gap-3">/a \
            <Button\
              variant="outline"\
              onClick={() => navigate("/settings")}\
              className="flex items-center justify-center w-10 h-10 rounded-xl text-muted-foreground hover:text-foreground"\
              title="Paramètres"\
            >\
              <SettingsIcon size={20} />\
            </Button>' src/components/Header.tsx
